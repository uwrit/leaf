-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetConceptHintsBySearchTerms]    Script Date: 3/28/19 1:44:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Authors:     Nic Dobbins
-- Create date: 2019/3/23
-- Description: Retrieves a list of concept hints for the given search terms.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptHintsBySearchTerms]
    @terms app.SearchTermTable READONLY,
    @rootId [uniqueidentifier] = NULL,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
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
	EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested;

	/*
	 * Return matches and their JSON tokens.
	 */
	SELECT TI.ConceptId
		 , TI.JsonTokens
	FROM app.ConceptTokenizedIndex TI
	WHERE EXISTS (SELECT 1 FROM @allowed A WHERE TI.ConceptId = A.Id)

END


GO
