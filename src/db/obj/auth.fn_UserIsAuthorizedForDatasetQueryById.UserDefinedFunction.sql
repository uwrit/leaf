-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [auth].[fn_UserIsAuthorizedForDatasetQueryById]    Script Date: 5/28/19 1:33:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/22
-- Description: Performs a security check on the requested DatasetQuery.
-- =======================================
CREATE FUNCTION [auth].[fn_UserIsAuthorizedForDatasetQueryById]
(
    @user [auth].[User],
    @groups [auth].[GroupMembership] READONLY,
    @id UNIQUEIDENTIFIER,
    @admin bit
)
RETURNS bit
AS
BEGIN
    -- Get the constraints for user and groups, make sure the constraint is satisfied.
    DECLARE @authorizations auth.Authorizations;

    INSERT INTO @authorizations (ConstraintId, ConstraintValue)
    SELECT
        dq.ConstraintId,
        dq.ConstraintValue
    FROM
        auth.DatasetQueryConstraint dq
    WHERE
        dq.DatasetQueryId = @id;

    RETURN auth.fn_UserIsAuthorized(@user, @groups, @authorizations, @admin);
END













GO
