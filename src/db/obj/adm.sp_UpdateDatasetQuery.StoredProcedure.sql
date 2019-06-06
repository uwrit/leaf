-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateDatasetQuery]    Script Date: 6/4/19 3:20:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Update a datasetquery.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateDatasetQuery]
    @id UNIQUEIDENTIFIER,
    @uid app.UniversalId,
    @shape int,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
    @tags app.DatasetQueryTagTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'DatasetQuery.Id is required.', 1;
	
	IF NOT EXISTS (SELECT Id FROM app.DatasetQuery WHERE Id = @id)
		THROW 70404, N'DatasetQuery not found.', 1;

    IF (@shape IS NULL)
        THROW 70400, N'DatasetQuery.Shape is required.', 1;
    
    IF NOT EXISTS (SELECT Id FROM ref.Shape WHERE Id = @shape)
        THROW 70404, N'DatasetQuery.Shape is not supported.', 1;
    
    IF (@name IS NULL)
        THROW 70400, N'DatasetQuery.Name is required.', 1;

    IF (@sql IS NULL)
        THROW 70400, N'DatasetQuery.SqlStatement is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        UPDATE app.DatasetQuery
        SET
            UniversalId = @uid,
            Shape = @shape,
            [Name] = @name,
            CategoryId = @catid,
            [Description] = @desc,
            SqlStatement = @sql,
            Updated = GETDATE(),
            UpdatedBy = @user
        OUTPUT
            deleted.Id,
            deleted.UniversalId,
            deleted.Shape,
            deleted.Name,
            deleted.CategoryId,
            deleted.[Description],
            deleted.SqlStatement,
            deleted.Created,
            deleted.CreatedBy,
            deleted.Updated,
            deleted.UpdatedBy
        WHERE Id = @id 

        DELETE FROM app.DatasetQueryTag
        OUTPUT deleted.DatasetQueryId, deleted.Tag
        WHERE DatasetQueryId = @id;

        INSERT INTO app.DatasetQueryTag (DatasetQueryId, Tag)
        SELECT @id, Tag
        FROM @tags;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END

GO
