-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [auth].[fn_UserIsAuthorized]    Script Date: 4/3/19 1:22:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Determines if a user satisfies the given Authorizations.
-- =======================================
CREATE FUNCTION [auth].[fn_UserIsAuthorized]
(
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @authorizations auth.Authorizations READONLY,
    @admin bit
)
RETURNS bit
AS
BEGIN

    -- pass through on admin
    IF (@admin = 1)
        RETURN 1;

    DECLARE @totalCount int;
    SELECT @totalCount = COUNT(*)
    FROM @authorizations;

    -- totally unconstrained, bail early with allow
    IF (@totalCount = 0)
        RETURN 1;
    
    DECLARE @userCount int;
    DECLARE @groupCount int;

    SELECT @userCount = COUNT(*)
    FROM @authorizations
    WHERE ConstraintId = 1; -- users

    SELECT @groupCount = COUNT(*)
    FROM @authorizations
    WHERE ConstraintId = 2; -- groups

    -- constrained by user
    IF (@userCount > 0)
    BEGIN;
        IF EXISTS (SELECT 1 FROM @authorizations WHERE ConstraintId = 1 AND ConstraintValue = @user)
            RETURN 1;
    END;

    -- constrained by group
    IF (@groupCount > 0)
    BEGIN;
        IF EXISTS
        (
            SELECT 1
            FROM @groups
            WHERE EXISTS (
                SELECT 1
                FROM @authorizations
                WHERE ConstraintId = 2
                AND ConstraintValue = [Group]
            )
        )
            RETURN 1;
    END;

    -- constraints are not satisfied
    RETURN 0;

END





GO
