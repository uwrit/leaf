-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateDatasetQueryCategory]    Script Date: 8/8/2019 3:56:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/6
-- Description: Updates an app.DatasetQueryCategory.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateDatasetQueryCategory]
    @id int,
    @cat nvarchar(200),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'DatasetQueryCategory.Id is required.', 1;

    IF (app.fn_NullOrWhitespace(@cat) = 1)
        THROW 70400, N'DatasetQueryCategory.Category is required.', 1;

    BEGIN TRAN;
    BEGIN TRY
        IF NOT EXISTS(SELECT 1 FROM app.DatasetQueryCategory WHERE Id = @id)
            THROW 70404, N'DatasetQueryCategory not found.', 1;

        IF EXISTS(SELECT Id FROM app.DatasetQueryCategory WHERE Id != @id AND Category = @cat)
            THROW 70409, N'DatasetQueryCategory already exists with that name.', 1;
        
        UPDATE app.DatasetQueryCategory
        SET
            Category = @cat,
            Updated = GETDATE(),
            UpdatedBy = @user
        OUTPUT
            inserted.Id,
            inserted.Category,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        WHERE Id = @id

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
