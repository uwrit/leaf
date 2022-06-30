-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateServerState]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Sets app state
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateServerState]
    @user NVARCHAR(100),
    @isUp BIT,
    @downtimeMessage NVARCHAR(2000),
    @downtimeFrom DATETIME,
    @downtimeUntil DATETIME
AS
BEGIN
    SET NOCOUNT ON

    UPDATE app.ServerState
    SET IsUp = @isUp
      , DowntimeMessage = @downtimeMessage
      , DowntimeFrom = @downtimeFrom
      , DowntimeUntil = @downtimeUntil
      , Updated = GETDATE()
      , UpdatedBy = @user

END

GO
