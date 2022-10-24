/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.12.0'
GO


/**
 * Add [Description] to app.ConceptSqlSet
 */
IF COLUMNPROPERTY(OBJECT_ID('app.DatasetQuery'), 'IsText', 'ColumnId') IS NULL
BEGIN
    ALTER TABLE app.DatasetQuery 
    ADD [IsText] BIT NULL
END
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/21
-- Description: Retrieves all DatasetQuery records to which the user is authorized.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetQueries]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @ids TABLE (
        Id UNIQUEIDENTIFIER NOT NULL
    );

    IF (@admin = 1)
    BEGIN;
        -- user is an admin, load them all
        INSERT INTO @ids
        SELECT dq.Id
        FROM app.DatasetQuery dq
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
        INSERT INTO @ids (Id)
        SELECT
            dq.Id
        FROM app.DatasetQuery dq
        WHERE EXISTS (
            SELECT 1
            FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = dq.Id AND
            ConstraintId = 1 AND
            ConstraintValue = @user
        )
        OR EXISTS (
            SELECT 1
            FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = dq.Id AND
            ConstraintId = 2 AND
            ConstraintValue in (SELECT [Group] FROM @groups)
        )
        OR NOT EXISTS (
            SELECT 1
            FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = dq.Id
        );
    END;

    -- produce the hydrated records
    SELECT
        i.Id,
        dq.UniversalId,
        dq.IsDefault,
        dq.Shape,
        dq.[Name],
        dqc.Category,
        dq.[Description],
        dq.SqlStatement,
        IsEncounterBased = ISNULL(ddq.IsEncounterBased, 1),
        dq.IsText,
        ddq.[Schema],
        ddq.SqlFieldDate,
        ddq.SqlFieldValueString,
        ddq.SqlFieldValueNumeric
    FROM @ids i
    JOIN app.DatasetQuery dq ON i.Id = dq.Id
	LEFT JOIN app.DynamicDatasetQuery ddq ON dq.Id = ddq.Id
    LEFT JOIN app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id

    -- produce the tags for each record
    SELECT
        i.Id,
        Tag
    FROM @ids i
    JOIN app.DatasetQueryTag t on i.Id = t.DatasetQueryId

END
GO
