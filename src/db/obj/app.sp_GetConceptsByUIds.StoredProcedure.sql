-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetConceptsByUIds]    Script Date: 6/12/19 9:23:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/10
-- Description: Retrieves Concepts requested by UniversalIds, filtered by constraint.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptsByUIds]
    @uids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @ids app.ResourceIdTable;
    INSERT INTO @ids
    SELECT Id
    FROM app.Concept c
    JOIN @uids u on c.UniversalId = u.UniversalId;
    
    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @ids, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END











GO
