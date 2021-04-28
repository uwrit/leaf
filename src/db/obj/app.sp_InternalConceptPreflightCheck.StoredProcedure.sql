-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_InternalConceptPreflightCheck]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/23
-- Description: Preflight checks institutionally referenced conceptIds.
-- Required Checks: Is concept present? Is the user authorized to execute?
-- =======================================
CREATE PROCEDURE [app].[sp_InternalConceptPreflightCheck]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @results app.ConceptPreflightTable;

    INSERT INTO @results (Id, IsPresent, IsAuthorized)
    SELECT Id, 0, 0 -- initialize bools to false
    FROM @ids;

    -- identify which ids are present
    WITH present as (
        SELECT Id, UniversalId
        FROM app.Concept c
        WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)
    )
    UPDATE @results
    SET
        UniversalId = p.UniversalId,
        IsPresent = 1
    FROM @results r
    JOIN present p on r.Id = p.Id

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
    WHERE EXISTS (SELECT 1 FROM @allowed a WHERE r.Id = a.Id)

    SELECT
        Id,
        UniversalId,
        IsPresent,
        IsAuthorized
    FROM @results;



END










GO
