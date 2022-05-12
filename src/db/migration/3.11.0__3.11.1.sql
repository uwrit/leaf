/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.11.1'
GO

/**
 * Add [Description] to app.ConceptSqlSet
 */
IF COLUMNPROPERTY(OBJECT_ID('app.ConceptSqlSet'), 'Description', 'ColumnId') IS NULL
BEGIN
    ALTER TABLE app.ConceptSqlSet 
    ADD [Description] NVARCHAR(200) NULL
END