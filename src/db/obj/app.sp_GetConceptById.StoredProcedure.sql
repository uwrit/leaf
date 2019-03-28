-- Copyright (c) 2019, UW Medicine Research IT
-- Developed by Nic Dobbins and Cliff Spital
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetConceptById]    Script Date: 3/28/19 1:44:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/7/2
-- Description: Retrieves a concept directly by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptById]
    @id [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceIdTable;

    INSERT INTO @requested
    SELECT @id;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested;

    IF ((SELECT COUNT(*) FROM @allowed) != 1)
        THROW 70403, 'User is not permitted.', 1;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END














GO
