-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetSavedBaseQueriesByConstraint]    Script Date: 4/8/19 1:11:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieves all saved query pointers owned by the given user.
-- =======================================
CREATE PROCEDURE [app].[sp_GetSavedBaseQueriesByConstraint]
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON;

    WITH permitted (QueryId) AS (
        -- user based constraint
        SELECT
            QueryId
        FROM auth.QueryConstraint
        WHERE ConstraintId = 1
        AND ConstraintValue = @user
        UNION
        -- group base constraint
        SELECT
            QueryId
        FROM auth.QueryConstraint
        WHERE ConstraintId = 2
        AND ConstraintValue IN (SELECT [Group] FROM @groups)
    )
    SELECT
        q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated,
        [Count] = COUNT(*)
    FROM app.Query q
    JOIN app.Cohort c on q.Id = c.QueryId
    WHERE (q.[Owner] = @user OR q.Id IN (SELECT QueryId FROM permitted))
    AND UniversalId IS NOT NULL
    AND Nonce IS NULL
    GROUP BY q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated;
END










GO
