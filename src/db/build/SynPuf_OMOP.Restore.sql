USE [master]
GO

IF DB_ID('SynPuf_OMOP') IS NULL
BEGIN
    PRINT 'Restoring SynPuf_OMOP database...'
    RESTORE DATABASE
        SynPuf_OMOP
    FROM DISK = '/data/SynPuf_OMOP.bak'
    WITH REPLACE
END
GO
