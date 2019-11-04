-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteConceptSqlSet]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/8/3
-- Description: Deletes an app.ConceptSqlSet by id.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteConceptSqlSet]
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.ConceptSqlSet WHERE Id = @id)
        THROW 70404, N'app.ConceptSqlSet is missing.', 1;

    BEGIN TRAN;
    BEGIN TRY
        DELETE FROM app.ConceptSqlSet
        WHERE Id = @id;

        COMMIT;

        SELECT Id = NULL, UniversalId = NULL, UiDisplayName = NULL
        WHERE 0 = 1;

        SELECT Id = NULL, UiDefaultText = NULL
        WHERE 0 = 1;
    END TRY
    BEGIN CATCH
        DECLARE @concepts TABLE (
            Id UNIQUEIDENTIFIER,
            UniversalId app.UniversalId NULL,
            UiDisplayName nvarchar(400) NULL
        );
        INSERT INTO @concepts
        SELECT Id, UniversalId, UiDisplayName
        FROM app.Concept
        WHERE app.Concept.SqlSetId = @id;

        DECLARE @specs TABLE (
            Id int,
            UiDefaultText nvarchar(100) NULL
        );
        INSERT INTO @specs
        SELECT Id, UiDefaultText
        FROM app.SpecializationGroup
        WHERE SqlSetId = @id;
        
        ROLLBACK;

        IF EXISTS(SELECT 1 FROM @concepts) OR EXISTS(SELECT 1 FROM @specs)
        BEGIN;
            SELECT Id, UniversalId, UiDisplayName
            FROM @concepts;

            SELECT Id, UiDefaultText
            FROM @specs;
            RETURN;
        END;
        THROW;
    END CATCH;
END





GO
