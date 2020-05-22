/*
 * Update version.
 */
UPDATE ref.[Version]
SET [Version] = '3.7.0'

/*
 * Add [Definition]
 */
ALTER TABLE app.Query ADD [Definition1] NVARCHAR(MAX) NULL

/*
 * Set historical [Definition] values to empty string
 */
UPDATE app.Query
SET [Definition] = ''

/*
 * Ensure [Definition] NOT NULL
 */
ALTER TABLE app.Query ALTER COLUMN [Definition] NVARCHAR(MAX) NOT NULL

/*
 * [app].[sp_GetDatasetContextById]
 */
IF OBJECT_ID('app.sp_GetDatasetContextById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetDatasetContextById];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.Id and DatasetQuery.Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetContextById]
    @datasetid UNIQUEIDENTIFIER,
    @queryid UNIQUEIDENTIFIER,
	@joinpanel BIT,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- queryconstraint ok?
    IF (auth.fn_UserIsAuthorizedForQueryById(@user, @groups, @queryid, @admin) = 0)
    BEGIN;
        DECLARE @query403 nvarchar(400) = @user + N' is not authorized to execute query ' + app.fn_StringifyGuid(@queryid);
        THROW 70403, @query403, 1;
    END;

    -- datasetconstraint ok?
    IF (auth.fn_UserIsAuthorizedForDatasetQueryById(@user, @groups, @datasetid, @admin) = 0)
    BEGIN;
        DECLARE @dataset403 nvarchar(400) = @user + N' is not authorized to execute dataset ' + app.fn_StringifyGuid(@datasetid);
        THROW 70403, @dataset403, 1;
    END;

    -- get pepper
    SELECT
        QueryId = Id,
        Pepper,
		[Definition] = CASE WHEN @joinpanel = 0 THEN NULL ELSE [Definition] END
    FROM
        app.Query
    WHERE Id = @queryid;

	-- dynamic
	IF EXISTS (SELECT 1 FROM app.DynamicDatasetQuery ddq WHERE ddq.Id = @datasetid)
		BEGIN
			SELECT
				ddq.Id,
				dq.[Name],
				dq.SqlStatement,
				ddq.IsEncounterBased,
				ddq.[Schema],
				ddq.SqlFieldDate,
				ddq.SqlFieldValueString,
				ddq.SqlFieldValueNumeric,
				dq.Shape
			FROM
				app.DynamicDatasetQuery ddq
			JOIN app.DatasetQuery dq ON ddq.Id = dq.Id
			LEFT JOIN
				app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id
			WHERE
				ddq.Id = @datasetid;
		END

	-- else shaped
	ELSE
		BEGIN
			SELECT
				dq.Id,
				dq.UniversalId,
				dq.Shape,
				dq.Name,
				dq.SqlStatement
			FROM
				app.DatasetQuery dq
			LEFT JOIN
				app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id
			WHERE
				dq.Id = @datasetid;
		END
END

/*
 * [app].[sp_UpdateSearchIndexTables]
 */
IF OBJECT_ID('app.sp_UpdateSearchIndexTables', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_UpdateSearchIndexTables];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/3/23
-- Description: Updates search index tables by diff'ing
--				rather than full truncate/insert, and updates
--              the ConceptTokenizedIndex table.
-- =======================================
CREATE PROCEDURE [app].[sp_UpdateSearchIndexTables]
AS
BEGIN
    SET NOCOUNT ON

	/**
	 * Find concepts where the content update
	 * time is greater than the last
	 * search token update time, or they've never been tokenized.
	 */
	DECLARE @ids app.ResourceIdTable
	INSERT INTO @ids
	SELECT C.Id
	FROM app.Concept C
	WHERE NOT EXISTS (SELECT 1 
					  FROM app.ConceptTokenizedIndex TI 
					  WHERE C.Id = TI.ConceptId 
						    AND TI.Updated > C.ContentLastUpdateDateTime)
	
	/**
	 * Ensure concepts have RootIds set.
	 */
	; WITH roots AS
	(
		SELECT RootId = c.Id
			 , RootUiDisplayName = c.UiDisplayName
			 , c.IsRoot
			 , c.Id
			 , c.ParentId
			 , c.UiDisplayName
		FROM app.Concept AS c
		WHERE c.IsRoot = 1
 
		UNION ALL
 
		SELECT roots.RootId
			 , roots.RootUiDisplayName
			 , c2.IsRoot
			 , c2.Id
			 , c2.ParentId
			 , c2.UiDisplayName
		FROM roots
			 INNER JOIN app.Concept c2
				ON c2.ParentId = roots.Id
	)
 
	UPDATE app.Concept
	SET RootId = roots.RootId
	FROM app.Concept AS C
		 INNER JOIN roots
			ON C.Id = roots.Id
	WHERE C.RootId IS NULL

	/**
	 * Insert concepts of interest for evaluation.
	 */
	CREATE TABLE #concepts (Id [uniqueidentifier] NULL, rootId [uniqueidentifier] NULL, uiDisplayName NVARCHAR(400) NULL)
	INSERT INTO #concepts
	SELECT Id
		  ,rootID
		  ,LEFT(UiDisplayName,400)
	FROM app.Concept C
	WHERE EXISTS (SELECT 1 FROM @ids ID WHERE C.Id = ID.Id)

	/**
	 * Remove puncuation and non-alphabetic characters.
	 */
	UPDATE #concepts
	SET uiDisplayName = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
						uiDisplayName,',',' '),':',' '),';',' '),'''',' '),'"',' '),']',' '),'[',' '),'(',' '),')',' '),'?',' '),'/',' '),'\',' '),'-',' ')

	/**
	 * Loop through each word in the uiDisplayName and separate each into its own row.
	 */
	DECLARE @loopCount INT = 0,
			@delimeter NVARCHAR(2) = ' ',
			@loopLimit INT = 30,
			@updatedRows INT = 1;

	CREATE TABLE #words
	(
		Word NVARCHAR(400) NULL,
		Id [uniqueidentifier] NULL,
		rootId [uniqueidentifier] NULL
	)

	WHILE @loopCount < @loopLimit AND @updatedRows > 0
	BEGIN

		BEGIN TRY DROP TABLE #currentWords END TRY BEGIN CATCH END CATCH

		/**
		 * Get the current left-most word (i.e. everything up to the first space " ").
		 */
		INSERT INTO #words
		SELECT Word = CASE CHARINDEX(@delimeter, uiDisplayName) 
						   WHEN 0 THEN LEFT(LTRIM(RTRIM(uiDisplayName)),400)
						   ELSE LEFT(LTRIM(RTRIM(LEFT(uiDisplayName, CHARINDEX(@delimeter, uiDisplayName)))),400) 
					  END
			  ,Id = c.Id
			  ,rootId = c.rootId
		FROM #concepts c

		/** 
		 * Update row count.
		 */
		SET @updatedRows = @@ROWCOUNT

		/**
		 * NULL out rows with no more spaces (their last word has already been inserted into the #words table).
		 */
		UPDATE #concepts
		SET uiDisplayName = NULL
		WHERE CHARINDEX(@delimeter, uiDisplayName) = 0
			  OR LEN(uiDisplayName) - CHARINDEX(@delimeter, uiDisplayName) < 0

		/**
		 * Chop off everything to the left of the first space " ".
		 */
		UPDATE #concepts
		SET uiDisplayName = NULLIF(LTRIM(RTRIM(RIGHT(uiDisplayName, LEN(uiDisplayName) - CHARINDEX(@delimeter, uiDisplayName) + 1))),'')
		WHERE uiDisplayName IS NOT NULL 
		  
		/**
		 * DELETE from table if no text left to process.
		 */
		DELETE FROM #concepts
		WHERE NULLIF(uiDisplayName,'') IS NULL

		/**
		 * Increment the @loopCount.
		 */ 
		SET @loopCount += 1

	END

	/**
	 * Index the output and remove any remaining whitespace.
	 */
	CREATE NONCLUSTERED INDEX IDX_WORD ON #words (Word ASC, Id ASC) INCLUDE (RootId)

	UPDATE #words
	SET Word = LOWER(LTRIM(RTRIM(REPLACE(Word, ' ',''))))

	DELETE FROM #words
	WHERE Word IN ('a','-','--','')

	/**
	 * Clear old data.
	 */
	DELETE app.ConceptForwardIndex
	FROM app.ConceptForwardIndex FI
	WHERE EXISTS (SELECT 1 FROM @ids ID WHERE FI.ConceptId = ID.Id)

	DELETE app.ConceptTokenizedIndex
	FROM app.ConceptTokenizedIndex TI
	WHERE NOT EXISTS (SELECT 1 FROM app.Concept C WHERE TI.ConceptId = C.Id)

	/**
	 * Set the last update time on included Concepts
	 * that were picked up here to make sure they
	 * aren't unnecessarily rerun next time due to 
	 * a NULL last update time.
	 */
	UPDATE app.Concept
	SET ContentLastUpdateDateTime = GETDATE()
	FROM app.Concept C
	WHERE EXISTS (SELECT 1 FROM @ids ID WHERE C.Id = ID.Id)
		  AND C.ContentLastUpdateDateTime IS NULL

	/**
	 * Add any words that didn't exist before.
	 */
	INSERT INTO app.ConceptInvertedIndex (Word)
	SELECT DISTINCT Word
	FROM #words W
	WHERE NOT EXISTS (SELECT 1 FROM app.ConceptInvertedIndex II WHERE W.Word = II.Word)

	/**
	 * Update forward index.
	 */
	INSERT INTO app.ConceptForwardIndex (WordId, Word, ConceptId, rootId)
	SELECT II.WordId, W.Word, W.Id, W.RootId
	FROM (SELECT DISTINCT Word, Id, RootId 
		  FROM #words) W
		  INNER JOIN app.ConceptInvertedIndex II
			ON W.Word = II.Word

	/**
	 * Create JSON string array of all tokens
	 * for a given Concept.
	 */
	SELECT ID.Id
		 , STUFF(
		 		 (SELECT '"' + W.Word + '",'
		 		  FROM #words W
		 		  WHERE W.Id = ID.Id
		 		  FOR XML PATH(''))
		  ,1,0,'') AS Tokens
	INTO #jsonTokens
	FROM @ids ID

	UPDATE #jsonTokens
	SET Tokens = '[' + LEFT(Tokens, LEN(Tokens) - 1) + ']'

	/**
	 * Merge into tokenized index.
	 */
	MERGE INTO app.ConceptTokenizedIndex AS tgt
	USING #jsonTokens as src
		ON tgt.ConceptId = src.Id
	WHEN MATCHED THEN
		UPDATE SET JsonTokens = Tokens
		         , Updated = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (ConceptId, JsonTokens, Updated)
		VALUES (src.Id, src.Tokens, GETDATE());

	/**
	 * Update word counts.
	 */
	; WITH wordCountCte AS
	(
		SELECT II.WordId, WordCount = COUNT(*)
		FROM app.ConceptInvertedIndex II
			 INNER JOIN app.ConceptForwardIndex FI
				ON II.WordId = FI.WordId
		GROUP BY II.WordId
	)

	UPDATE app.ConceptInvertedIndex
	SET WordCount = CTE.WordCount
	FROM app.ConceptInvertedIndex II
		 INNER JOIN wordCountCte CTE
			ON II.WordId = CTE.WordId

	/**
	 * Cleanup temp tables.
	 */
	DROP TABLE #concepts
	DROP TABLE #words
	DROP TABLE #jsonTokens

END


