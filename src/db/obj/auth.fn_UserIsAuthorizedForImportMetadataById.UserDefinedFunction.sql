-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [auth].[fn_UserIsAuthorizedForImportMetadataById]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/10/14
-- Description: Performs a security check on the requested ImportMetadataId.
-- =======================================
CREATE FUNCTION [auth].[fn_UserIsAuthorizedForImportMetadataById]
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
        IM.ConstraintId,
        IM.ConstraintValue
    FROM
        auth.ImportMetadataConstraint AS IM
    WHERE
        IM.ImportMetadataId = @id;

    RETURN auth.fn_UserIsAuthorized(@user, @groups, @authorizations, @admin);

END

GO
