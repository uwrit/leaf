-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [auth].[fn_UserIsAuthorizedForQueryById]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Performs a security check on the requested Query.
-- =======================================
CREATE FUNCTION [auth].[fn_UserIsAuthorizedForQueryById]
(
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @id UNIQUEIDENTIFIER,
    @admin bit
)
RETURNS  bit
AS
BEGIN
    -- Get the constraints for user and groups, make sure the constraint is satisfied
    DECLARE @authorizations auth.Authorizations;

    INSERT INTO @authorizations (ConstraintId, ConstraintValue)
    SELECT
        qc.ConstraintId,
        qc.ConstraintValue
    FROM
        auth.QueryConstraint qc
    WHERE
        qc.QueryId = @id;

    RETURN auth.fn_UserIsAuthorized(@user, @groups, @authorizations, @admin);
END






GO
