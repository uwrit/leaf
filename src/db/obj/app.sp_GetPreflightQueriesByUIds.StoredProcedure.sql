-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightQueriesByUIds]    Script Date: 8/8/2019 3:56:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a query preflight check by Ids.
-- =======================================
CREATE PROCEDURE [app].[sp_GetPreflightQueriesByUIds]
    @quids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    declare @preflight table (
        QueryId UNIQUEIDENTIFIER,
        QueryUniversalId app.UniversalId,
        QueryVer int,
        QueryIsPresent bit null,
        QueryIsAuthorized bit null,
        ConceptId UNIQUEIDENTIFIER,
        ConceptUniversalId app.UniversalId null,
        ConceptIsPresent bit null,
        ConceptIsAuthorized bit null
    );


    with initial (QueryId, UniversalId, Ver, IsPresent) as (
        select aq.Id, qs.UniversalId, Ver, IsPresent = case when aq.Id is not null then cast(1 as bit) else cast(0 as bit) end
        from @quids qs
        left join app.Query aq on qs.UniversalId = aq.UniversalId
    ),
    queries (QueryId, IsPresent) as (
        select qs.QueryId, IsPresent
        from initial qs
        left join app.Query aq on qs.QueryId = aq.Id
        union all
        select qd.DependsOn, cast(1 as bit)
        from queries q
        join rela.QueryDependency qd on qd.QueryId = q.QueryId
    ),
    enriched (QueryId, UniversalId, Ver, IsPresent) as (
        select
            qs.QueryId,
            q.UniversalId,
            q.Ver,
            qs.IsPresent
        from queries qs
        left join app.Query q on qs.QueryId = q.Id
    ),
    authQ (QueryId, UniversalId, Ver, IsPresent, IsAuthorized) as (
        select e.QueryId, e.UniversalId, e.Ver, e.IsPresent, auth.fn_UserIsAuthorizedForQueryById(@user, @groups, e.QueryId, @admin)
        from enriched e
    ),
    withConcepts (QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId) as (
        select a.*, ConceptId = qc.DependsOn
        from authQ a
        left join rela.QueryConceptDependency qc on a.QueryId = qc.QueryId
    )
    insert into @preflight (QueryId, QueryUniversalId, QueryVer, QueryIsPresent, QueryIsAuthorized, ConceptId)
    select QueryId, UniversalId, Ver, IsPresent, NULL, NULL
    from initial
    where QueryId is null
    union
    select QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId
    from withConcepts;

    declare @concIds app.ResourceIdTable;
    insert into @concIds
    select distinct ConceptId
    from @preflight;

    declare @conceptAuths app.ConceptPreflightTable;
    insert @conceptAuths
    exec app.sp_InternalConceptPreflightCheck @concIds, @user, @groups, @admin = @admin;

    update p
    set
        p.ConceptUniversalId = ca.UniversalId,
        p.ConceptIsPresent = ca.IsPresent,
        p.ConceptIsAuthorized = ca.IsAuthorized
    from @preflight p
    join @conceptAuths ca on p.ConceptId = ca.Id;

    select *
    from @preflight
    order by QueryId desc;
END
GO
