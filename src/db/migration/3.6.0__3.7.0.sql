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
ALTER PROCEDURE [app].[sp_GetDatasetContextById]
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