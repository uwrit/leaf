-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
/****** Object:  StoredProcedure [auth].[sp_GetUserGroupsAndRoles]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/10/19
-- Description: Gets user roles
-- =======================================
CREATE PROCEDURE [auth].[sp_GetUserGroupsAndRoles]
    @scopedId nvarchar(200)
AS
BEGIN
    SET NOCOUNT ON

    -- Roles
    SELECT IsUser, IsAdmin, IsSuper, IsIdentified, IsFederated
    FROM [auth].[UserRole] AS R
    WHERE R.ScopedIdentity = @scopedId

    -- Groups
    SELECT GroupName
    FROM [auth].[UserGroup] AS G
    WHERE G.ScopedIdentity = @scopedId

END
GO