-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetSavedQueryByUId]    Script Date: 6/6/19 8:49:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieve a query by UniversalId if owner.
-- =======================================
CREATE PROCEDURE [app].[sp_GetSavedQueryByUId]
    @uid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- translate to local id
    DECLARE @id uniqueidentifier;
    SELECT @id = Id
    FROM app.Query
    WHERE UniversalId = @uid;

    DECLARE @result TABLE (
        Id UNIQUEIDENTIFIER NOT NULL,
        UniversalId nvarchar(200) NOT NULL,
        [Name] nvarchar(400) NULL,
        [Category] nvarchar(400) NULL,
        [Owner] nvarchar(1000) NOT NULL,
        Created datetime NOT NULL,
        [Definition] app.QueryDefinitionJson,
        Updated datetime not null,
        [Count] int null
    );

    -- if not found
    IF @id IS NULL
    BEGIN
        SELECT
            Id,
            UniversalId,
            [Name],
            [Category],
            [Owner],
            Created,
            Updated,
            [Definition],
            [Count]
        FROM @result;
        RETURN;
    END;

    -- permission filter
    WITH permitted AS (
        -- user based constraint
        SELECT
            QueryId
        FROM auth.QueryConstraint
        WHERE QueryId = @id
        AND ConstraintId = 1
        AND ConstraintValue = @user
        UNION
        -- group base constraint
        SELECT
            QueryId
        FROM auth.QueryConstraint
        WHERE QueryId = @id
        AND ConstraintId = 2
        AND ConstraintValue IN (SELECT [Group] FROM @groups)
    )
    INSERT INTO @result (Id, UniversalId, [Name], [Category], [Owner], Created, Updated, [Definition])
    SELECT
        q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated,
        d.[Definition]
    FROM app.Query q
    JOIN app.QueryDefinition d on q.Id = d.QueryId
    WHERE (q.[Owner] = @user OR q.Id IN (SELECT Id FROM permitted))
		  AND q.UniversalId = @uid;

    -- did not pass filter
    IF (SELECT COUNT(*) FROM @result) < 1
		BEGIN
			DECLARE @secmsg nvarchar(400) = @user + ' not permitted to query ' + @uid;
			THROW 70403, @secmsg, 1
		END;
    
    -- collect counts
    WITH counts (QueryId, Cnt) as (
        SELECT QueryId, Cnt = COUNT(*)
        FROM @result r
        JOIN app.Cohort c on r.Id = c.QueryId
        GROUP BY QueryId
    )
    UPDATE r
    SET [Count] = c.Cnt
    FROM @result r
    JOIN counts c on c.QueryId = r.Id;


    -- return
    SELECT
        Id,
        UniversalId,
        [Name],
        [Category],
        [Owner],
        Created,
        Updated,
        [Definition],
        [Count]
    FROM @result;
END











GO
