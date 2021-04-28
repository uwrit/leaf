-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteDatasetQueryCategory]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/6
-- Description: Delete an app.DatasetQueryCategory if there are no dependents.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteDatasetQueryCategory]
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.DatasetQueryCategory WHERE Id = @id)
        THROW 70404, N'DatasetQueryCategory not found.', 1;
    
    BEGIN TRAN;

    DECLARE @deps TABLE (
        Id uniqueidentifier not null
    );
    INSERT INTO @deps (Id)
    SELECT Id
    FROM app.DatasetQuery
    WHERE CategoryId = @id;

    IF EXISTS(SELECT 1 FROM @deps)
    BEGIN;
        -- there are dependents, bail
        ROLLBACK;

        SELECT Id
        FROM @deps;

        RETURN;
    END;

    DELETE FROM app.DatasetQueryCategory
    WHERE Id = @id;

    COMMIT;

    -- No dependents.
    SELECT Id = NULL
    WHERE 0 = 1;
END
GO
