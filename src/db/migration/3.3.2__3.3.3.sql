/*
 * Update version.
 */
IF EXISTS (SELECT 1 FROM [ref].[Version])
    UPDATE ref.Version
    SET [Version] = '3.3.3'
ELSE 
    INSERT INTO ref.[Version] (Lock, Version)
    SELECT 'X', '3.3.3'

