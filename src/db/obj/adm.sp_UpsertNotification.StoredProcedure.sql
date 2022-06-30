-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpsertNotification]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/5
-- Description: Updates or inserts a notification
-- =======================================
CREATE PROCEDURE [adm].[sp_UpsertNotification]
    @user NVARCHAR(100),
    @id UNIQUEIDENTIFIER = NULL,
    @message NVARCHAR(2000),
    @until DATETIME
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @upserted TABLE ([Id] [uniqueidentifier], [Message] NVARCHAR(2000), [Until] DATETIME, [Created] DATETIME , [CreatedBy] NVARCHAR(1000), [Updated] DATETIME , [UpdatedBy] NVARCHAR(1000))

    IF @id IS NULL
    BEGIN
        INSERT INTO app.Notification ([Message], Until, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.Message, inserted.Until, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy INTO @upserted
        SELECT @message, @until, GETDATE(), @user, GETDATE(), @user
    END

    ELSE
    BEGIN
        UPDATE app.Notification
        SET [Message] = @message
          , Until = @until
          , Updated = GETDATE()
          , UpdatedBy = @user
        OUTPUT inserted.Id, inserted.Message, inserted.Until, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy INTO @upserted
        WHERE Id = @id
    END

    SELECT * FROM @upserted

END

GO
