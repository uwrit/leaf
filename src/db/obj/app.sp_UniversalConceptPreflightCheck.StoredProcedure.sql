-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_UniversalConceptPreflightCheck]    Script Date: 5/2/19 11:58:02 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Preflight checks universally referenced conceptIds.
-- Required Checks: Is concept present? Is the user authorized to execute?
-- =======================================
CREATE PROCEDURE [app].[sp_UniversalConceptPreflightCheck]
    @uids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @results app.ConceptPreflightTable;

    INSERT INTO @results (UniversalId, IsPresent, IsAuthorized)
    SELECT UniversalId, 0, 0 -- initialize bools to false
    FROM @uids;

    -- identify which ids are present
    WITH present as (
        SELECT Id, UniversalId
        FROM app.Concept c
        WHERE EXISTS (SELECT 1 FROM @uids u WHERE u.UniversalId = c.UniversalId)
    )
    UPDATE @results
    SET
        Id = p.Id,
        IsPresent = 1
    FROM @results r
    JOIN present p on r.UniversalId = p.UniversalId;

    -- identify which ids are authorized
    -- dont bother checking missing concepts
    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT Id
    FROM @results
    WHERE IsPresent = 1;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id FROM app.fn_FilterConceptsByConstraint(@user, @groups, @requested, @admin);

    UPDATE @results
    SET
        IsAuthorized = 1
    FROM @results r
    WHERE EXISTS (SELECT 1 FROM @allowed a WHERE r.Id = a.Id);

    SELECT
        Id,
        UniversalId,
        IsPresent,
        IsAuthorized
    FROM @results;

END








GO
