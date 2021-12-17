-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [app].[fn_FilterConceptsByConstraint]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Recursively (ancestry applies) filters a list of concept ids by ConceptConstraint relationships.
-- =======================================
CREATE FUNCTION [app].[fn_FilterConceptsByConstraint]
(
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @requested app.ResourceIdTable READONLY,
    @admin bit
)
RETURNS @allowed TABLE (
    [Id] [uniqueidentifier] NULL
)
AS
BEGIN

    IF (@admin = 1)
    BEGIN;
        INSERT INTO @allowed
        SELECT Id
        FROM @requested;
        RETURN;
    END;

    DECLARE @ancestry table
    (
        [Base] [uniqueidentifier] not null,
        [Current] [uniqueidentifier] not null,
        [Parent] [uniqueidentifier] null
    );

    -- Fetch the full ancestry of all requested Ids.
    WITH recRoots (Base, Id, ParentId) as
    (
        SELECT i.Id, i.Id, c.Parentid
        FROM @requested i
        JOIN app.Concept c on i.Id = c.Id

        UNION ALL

        SELECT r.Base, c.Id, c.ParentId
        FROM app.Concept c
        JOIN recRoots r on c.Id = r.ParentId
    )
    INSERT INTO @ancestry
    SELECT Base, Id, ParentId
    FROM recRoots;

    -- Identify any requested Ids that are disallowed by constraint anywhere in their ancestry.
    DECLARE @disallowed app.ResourceIdTable;
    WITH constrained AS
        (
            SELECT c.ConceptId, c.ConstraintId, c.ConstraintValue
            FROM auth.ConceptConstraint c
            WHERE EXISTS (SELECT 1 FROM @ancestry a WHERE a.[Current] = c.ConceptId)
        )
    , permitted AS
    (
        SELECT 
            a.Base
        , a.[Current]
        , HasConstraint = CASE WHEN EXISTS 
                        (SELECT 1 FROM constrained c 
                WHERE c.ConceptId = a.[Current])
                        THEN 1 ELSE 0 END
        , UserPermitted = CASE WHEN EXISTS 
                        (SELECT 1 FROM constrained c 
                WHERE c.ConceptId = a.[Current] 
                        AND c.ConstraintId = 1 
                        AND c.ConstraintValue = @user)
                        THEN 1 ELSE 0 END
        , GroupPermitted = CASE WHEN EXISTS 
                        (SELECT 1 FROM constrained c 
                WHERE c.ConceptId = a.[Current] 
                        AND c.ConstraintId = 2 
                        AND c.ConstraintValue IN (SELECT g.[Group] FROM @groups g))
                        THEN 1 ELSE 0 END
        FROM @ancestry a
    )
    INSERT INTO @disallowed
    SELECT p.Base
    FROM permitted p
    WHERE p.HasConstraint = 1
        AND (p.UserPermitted = 0 AND p.GroupPermitted = 0)

    -- Select only the allowed requested ids.
    INSERT INTO @allowed
    SELECT Id
    FROM @requested
    WHERE Id NOT IN (
        SELECT Id
        FROM @disallowed
    );
    RETURN;
END










GO
