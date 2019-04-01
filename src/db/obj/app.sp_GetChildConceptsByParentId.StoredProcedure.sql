-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetChildConceptsByParentId]    Script Date: 4/1/19 10:56:32 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/7/2
-- Description: Retrieves children concepts of the given parent concept.
-- =======================================
CREATE PROCEDURE [app].[sp_GetChildConceptsByParentId]
    @parentId UNIQUEIDENTIFIER,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- ensure user can see parent
    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT @parentId;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    IF ((SELECT COUNT(*) FROM @allowed) != 1)
        THROW 70403, 'User is not permitted.', 1;

    -- clear tables for reuse
    DELETE FROM @requested;
    DELETE FROM @allowed;

    -- ensure only permitted children are returned
    INSERT INTO @requested
    SELECT
        Id
    FROM app.Concept
    WHERE ParentId = @parentId;

    -- TODO(cspital) this is wasteful, we've already checked parent up to root, just need to check children, write focused version with no recursion
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested;

    EXEC app.sp_HydrateConceptsByIds @allowed;

END














GO
