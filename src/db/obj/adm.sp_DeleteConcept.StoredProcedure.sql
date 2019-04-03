-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteConcept]    Script Date: 4/3/19 1:22:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/4/1
-- Description: Deletes a concept if unhooked, returns dependents.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteConcept]
    @id uniqueidentifier,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;

    IF NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @id)
    BEGIN;
        THROW 70404, N'Concept not found.', 1;
    END;

    declare @filters table (
        Id int,
        UiDisplayText nvarchar(1000) NULL
    );
    INSERT INTO @filters
    SELECT Id, UiDisplayText
    FROM app.PanelFilter
    WHERE ConceptId = @id;

    declare @queries table (
        Id uniqueidentifier,
        UniversalId nvarchar(200) null,
        [Name] nvarchar(200) null,
        [Owner] nvarchar(200) not null
    );
    INSERT INTO @queries
    SELECT q.Id, q.UniversalId, q.[Name], q.[Owner]
    FROM app.Query q
    JOIN rela.QueryConceptDependency cd on q.Id = cd.QueryId
    WHERE cd.DependsOn = @id;

    declare @concepts table(
        Id UNIQUEIDENTIFIER,
        UniversalId nvarchar(200) null,
        UiDisplayName nvarchar(400) null
    );
    INSERT INTO @concepts
    SELECT Id, UniversalId, UiDisplayName
    FROM app.Concept
    WHERE ParentId = @id OR (RootId = @id AND Id != @id);

    IF NOT(EXISTS(SELECT 1 FROM @filters) OR EXISTS(SELECT 1 FROM @queries) OR EXISTS(SELECT 1 FROM @concepts))
    BEGIN;
        BEGIN TRY
            DELETE FROM auth.ConceptConstraint
            WHERE ConceptId = @id;

            DELETE FROM rela.ConceptSpecializationGroup
            WHERE ConceptId = @id;

            DELETE FROM app.Concept
            WHERE Id = @id;

            COMMIT;
        END TRY
        BEGIN CATCH
            ROLLBACK;
        END CATCH;
    END;
    ELSE
    BEGIN;
        ROLLBACK;
    END;

    SELECT Id, UiDisplayText
    FROM @filters;
    SELECT Id, UniversalId, [Name], [Owner]
    FROM @queries;
    SELECT Id, UniversalId, UiDisplayName
    FROM @concepts;
END
GO
