-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetDashboardConfig]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/12/3
-- Description: Gets JSON dashboard configuration
-- =======================================
CREATE PROCEDURE [app].[sp_GetDashboardConfig]
    @id uniqueidentifier,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    SELECT TOP 1 D.Id, D.JsonConfig, D.UiDisplayName, D.UiDisplayDescription
    FROM [app].[Dashboard] AS D
    WHERE D.Id = @id

END

GO
