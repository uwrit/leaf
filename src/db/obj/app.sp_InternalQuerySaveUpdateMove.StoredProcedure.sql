-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_InternalQuerySaveUpdateMove]    Script Date: 6/12/19 12:20:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Performs a resave of an existing query.
-- =======================================
CREATE PROCEDURE [app].[sp_InternalQuerySaveUpdateMove]
    @oldqueryid UNIQUEIDENTIFIER,
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @ver int,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @created table (
        created datetime
    );

    -- satisfy the FK
    UPDATE app.Query
    SET UniversalId = NULL
    OUTPUT deleted.Created INTO @created
    WHERE Id = @oldqueryid;

    -- delegate to sp_InternalQuerySaveInitial
    EXEC app.sp_InternalQuerySaveInitial @queryid, @urn, @ver, @name, @category, @conceptids, @queryids, @definition, @user;

    UPDATE app.Query
    SET Created = (SELECT TOP 1 created FROM @created)
    WHERE Id = @queryid;

    -- move constraints from oldqueryid that isn't user & owner record
    INSERT INTO auth.QueryConstraint
    SELECT @queryid, ConstraintId, ConstraintValue
    FROM auth.QueryConstraint
    WHERE QueryId = @oldqueryid and ConstraintId != 1 and ConstraintValue != @user;

    -- cleanup the oldqueryid
    -- remove cached cohort
    DELETE FROM app.Cohort
    WHERE QueryId = @oldqueryid;

    -- unconstrain query
    DELETE FROM auth.QueryConstraint
    WHERE QueryId = @oldqueryid;

    -- delete definition
    DELETE FROM app.QueryDefinition
    WHERE QueryId = @oldqueryid;

    -- migrate dependents over to new id before deleting old deps
    UPDATE rela.QueryDependency
    SET DependsOn = @queryid
    WHERE DependsOn = @oldqueryid;

    -- update dependents definition to new id (search/replace)
    WITH directParents(QueryId) as (
        SELECT QueryId
        FROM rela.QueryDependency
        WHERE DependsOn = @oldqueryid
    )
    UPDATE app.QueryDefinition
    SET
        [Definition] = REPLACE([Definition], cast(@oldqueryid as [nvarchar](50)), cast(@queryid as [nvarchar](50)))
    WHERE QueryId IN (SELECT QueryId FROM directParents);

    -- delete dependencies
    DELETE FROM rela.QueryConceptDependency
    WHERE QueryId = @oldqueryid;

    DELETE FROM rela.QueryDependency
    WHERE QueryId = @oldqueryid;

    -- delete unsaved query
    DELETE FROM app.Query
    WHERE Id = @oldqueryid;
END








GO
