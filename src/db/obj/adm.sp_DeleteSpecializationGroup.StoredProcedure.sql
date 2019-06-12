-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteSpecializationGroup]    Script Date: 6/12/19 12:20:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/14
-- Description: Deletes an app.SpecializationGroup and associated app.Specialization if FKs are satisfied.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteSpecializationGroup]
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.SpecializationGroup WHERE Id = @id)
        THROW 70404, N'SpecializationGroup not found.', 1;

    BEGIN TRAN;

    DECLARE @deps TABLE (
        Id UNIQUEIDENTIFIER NOT NULL,
        UniversalId nvarchar(200) NULL,
        UiDisplayName nvarchar(400) NULL
    );
    INSERT INTO @deps (Id, UniversalId, UiDisplayName)
    SELECT c.Id, c.UniversalId, c.UiDisplayName
    FROM app.Concept c
    JOIN rela.ConceptSpecializationGroup csg ON c.Id = csg.ConceptId
    WHERE csg.SpecializationGroupId = @id;

    IF EXISTS(SELECT 1 FROM @deps)
    BEGIN;
        -- there are dependents, bail
        ROLLBACK;

        SELECT Id, UniversalId, UiDisplayName
        FROM @deps;

        RETURN;
    END;

    DELETE FROM app.Specialization
    WHERE SpecializationGroupId = @id;

    DELETE FROM app.SpecializationGroup
    WHERE Id = @id;

    COMMIT;

    SELECT Id = NULL, UniversalId = NULL, UiDisplayName = NULL
    WHERE 0 = 1;

END



GO
