-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetConceptsBySearchTerms]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Author:      Nic Dobbins; Ported by Cliff Spital
-- Create date: 2018/6/27
-- Description: Retrieves concepts matching the given search terms.
-- Old name:    sp_GetSearchConceptsByTerm
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptsBySearchTerms]
    @terms app.SearchTermTable READONLY,
    @rootId [uniqueidentifier] = NULL,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceIdTable
	DECLARE @allowed app.ResourceIdTable
    DECLARE @initialTerm NVARCHAR(30) = (SELECT TOP (1) Term FROM @terms)
	DECLARE @termLastIdx INT = (SELECT COUNT(*) FROM @terms) - 1

	/*
	 * Find hits for initial term.
	 */
	; WITH cte AS 
	(
		SELECT FI.ConceptId, FI.Word, Lvl = 0
		FROM app.ConceptForwardIndex FI
		WHERE (@rootId IS NULL OR FI.RootId = @rootId)
			  AND EXISTS 
			(
				SELECT 1
				FROM app.ConceptInvertedIndex II
				WHERE II.Word LIKE @initialTerm + '%'
					  AND FI.WordId = II.WordId
			)
	)

	/*
	 * Recurse through following terms.
	 */
	, cte2 AS
	(
		SELECT ConceptId, Lvl
		FROM cte

		UNION ALL

		SELECT cte2.ConceptId, Lvl = cte2.Lvl + 1
		FROM cte2
		WHERE EXISTS 
			(
				SELECT 1
				FROM app.ConceptForwardIndex FI
				WHERE cte2.ConceptId = FI.ConceptId
					  AND (@rootId IS NULL OR FI.RootId = @rootId)
					  AND EXISTS 
							(
								SELECT 1
								FROM @terms T 
									 INNER JOIN app.ConceptInvertedIndex II
										ON II.Word LIKE T.Term + '%'
								WHERE FI.WordId = II.WordId
									  AND T.Id = cte2.Lvl + 1
							)
			)
	)

	/*
	 * Limit to only TOP 100 Concepts that matched all terms.
	 */
	, cte3 AS
	(
		SELECT TOP (100) ConceptId
		FROM cte2
		WHERE Lvl = @termLastIdx
	)

	INSERT INTO @requested
	SELECT ConceptId
	FROM cte3

	/*
	 * Filter out any Concepts not allowed for user.
	 */
	INSERT INTO @allowed
	EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    EXEC app.sp_GetParentConceptsByChildIds @allowed, @user, @groups, @admin = @admin;

END




GO
