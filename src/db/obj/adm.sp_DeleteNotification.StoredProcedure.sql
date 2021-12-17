-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteNotification]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/5
-- Description: Deletes a notification
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteNotification]
    @id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @deleted TABLE ([Id] [uniqueidentifier], [Message] NVARCHAR(2000), [Until] DATETIME, [Created] DATETIME , [CreatedBy] NVARCHAR(1000), [Updated] DATETIME , [UpdatedBy] NVARCHAR(1000))

    IF NOT EXISTS(SELECT 1 FROM app.Notification WHERE Id = @id)
        BEGIN;
            THROW 70404, N'Notification not found.', 1;
        END;

    DELETE FROM app.Notification
    OUTPUT deleted.Id, deleted.Message, deleted.Until, deleted.Created, deleted.CreatedBy, deleted.Updated, deleted.UpdatedBy INTO @deleted
    WHERE Id = @id

    SELECT * FROM @deleted

END

GO
