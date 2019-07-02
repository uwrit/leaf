ALTER PROCEDURE [adm].[sp_UpdateDemographicQuery]
    @sql nvarchar(4000),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DemographicQuery.SqlStatement is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        
        IF EXISTS (SELECT Lock FROM app.DemographicQuery)
        BEGIN;
            UPDATE app.DemographicQuery
            SET
                SqlStatement = @sql,
                LastChanged = GETDATE(),
                ChangedBy = @user
            OUTPUT
                inserted.SqlStatement,
                inserted.LastChanged,
                inserted.ChangedBy;
        END;
        ELSE
        BEGIN;
            INSERT INTO app.DemographicQuery (SqlStatement, LastChanged, ChangedBy, Shape)
            OUTPUT inserted.SqlStatement, inserted.LastChanged, inserted.ChangedBy, inserted.Shape
            VALUES (@sql, GETDATE(), @user, 3);
        END;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END

GO

IF EXISTS (SELECT 1 FROM ref.Version)
    UPDATE ref.Version
    SET [Version] = '3.2.2'
ELSE 
    INSERT INTO ref.[Version] (Lock, Version)
    SELECT 'X', '3.2.2'