-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetQueries]    Script Date: 5/20/19 10:56:05 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/21
-- Description: Retrieves all DatasetQuery records to which the user is authorized.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetQueries]
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    declare @ids table (
        Id UNIQUEIDENTIFIER NOT NULL
    );

    -- store ids, then hydrate the records and reuse to get the tags
    insert into @ids (Id)
    select distinct
        dq.Id
    from app.DatasetQuery dq
    where exists (
        select 1
        from auth.DatasetQueryConstraint
        where DatasetQueryId = dq.Id and
        ConstraintId = 1 and
        ConstraintValue = @user
    )
    or exists (
        select 1
        from auth.DatasetQueryConstraint
        where DatasetQueryId = dq.Id and
        ConstraintId = 2 and
        ConstraintValue in (select [Group] from @groups)
    )
    or not exists (
        select 1
        from auth.DatasetQueryConstraint
        where DatasetQueryId = dq.Id
    );

    -- produce the hydrated records
    select
        i.Id,
        dq.UniversalId,
        dq.Shape,
        dq.Name,
        dqc.Category,
        dq.[Description],
        dq.SqlStatement
    from @ids i
    join app.DatasetQuery dq on i.Id = dq.Id
    left join app.DatasetQueryCategory dqc on dq.CategoryId = dqc.Id;

    -- produce the tags for each record
    select
        i.Id,
        Tag
    from @ids i
    join app.DatasetQueryTag t on i.Id = t.DatasetQueryId

END






GO
