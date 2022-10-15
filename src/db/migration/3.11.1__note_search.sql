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