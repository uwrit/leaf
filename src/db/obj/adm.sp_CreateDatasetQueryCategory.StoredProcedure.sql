-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreateDatasetQueryCategory]    Script Date: 6/12/19 12:20:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Creates an app.DatasetQueryCategory
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateDatasetQueryCategory]
    @cat nvarchar(200),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@cat) = 1)
        THROW 70400, N'DatasetQueryCategory.Category is required.', 1;

    BEGIN TRAN;
    BEGIN TRY
        IF EXISTS(SELECT Id FROM app.DatasetQueryCategory WHERE Category = @cat)
            THROW 70409, N'DatasetQueryCategory already exists with that name.', 1;
        
        INSERT INTO app.DatasetQueryCategory (Category, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.Category, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy
        VALUES(@cat, GETDATE(), @user, GETDATE(), @user);

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
