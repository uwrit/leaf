-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetServerStateAndNotifications]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Gets app state and notifications, first deleting old notifications
-- =======================================
CREATE PROCEDURE [app].[sp_GetServerStateAndNotifications]
AS
BEGIN
    SET NOCOUNT ON

    -- Delete stale messages
    DELETE FROM app.Notification
    WHERE Until < GETDATE()

    -- Set IsUp = 1 if downtime has passed
    UPDATE app.ServerState
    SET IsUp = 1
      , DowntimeFrom    = NULL
      , DowntimeUntil   = NULL
      , DowntimeMessage = NULL
    WHERE DowntimeUntil < GETDATE()

    -- Server state
    SELECT IsUp, DowntimeMessage, DowntimeFrom, DowntimeUntil
    FROM app.ServerState

    -- Notifications
    SELECT Id, [Message]
    FROM app.Notification

    -- Version
    SELECT [Version]
    FROM ref.Version

END

GO
