USE [LeafDB]
GO

/*
 * Update version.
 */
UPDATE ref.[Version]
SET [Version] = '3.6.0'

/*
 * [adm].[sp_GetUsersBySearchTerm]
 */
IF OBJECT_ID('adm.sp_GetUsersBySearchTerm', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetUsersBySearchTerm];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/11/15
-- Description: Retrieves all users who matching a given search string.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetUsersBySearchTerm]
    @term NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON

    SELECT 
		L.Id
	  , L.ScopedIdentity
	  , L.FullIdentity
	  , SavedQueryCount = (SELECT COUNT(*) FROM [app].[Query] AS Q WHERE L.FullIdentity = Q.[Owner] AND Q.UniversalId IS NOT NULL AND Q.Nonce IS NULL)
	  , L.Created
	  , L.Updated
	FROM auth.[Login] AS L
	WHERE L.ScopedIdentity LIKE @term + '%'

END
GO


