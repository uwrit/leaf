/*
 * Update version.
 */
UPDATE ref.[Version]
SET [Version] = '3.9.0'
GO

IF OBJECT_ID('app.sp_GetConceptByUId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptByUId];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves Concept requested by UniversalId, filtered by constraint.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptByUId]
    @uid NVARCHAR(200),
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @ids app.ResourceIdTable;
    INSERT INTO @ids
    SELECT Id
    FROM app.Concept c
    WHERE c.UniversalId = @uid
    
    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @ids, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the app.Query.Pepper and Concept by Id.
-- =======================================
IF OBJECT_ID('app.sp_GetConceptDatasetContextById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptDatasetContextById];
GO
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextById]
    @queryid UNIQUEIDENTIFIER,
    @conceptid [uniqueidentifier],
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

    -- get pepper
    SELECT
        QueryId = Id,
        Pepper
    FROM app.Query
    WHERE Id = @queryid;

    -- concept
    EXEC app.sp_GetConceptById @conceptid, @user, @groups, @admin
END
GO

IF OBJECT_ID('app.sp_GetConceptDatasetContextByUId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptDatasetContextByUId];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the app.Query.Pepper and Concept by UId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextByUId]
    @queryuid UNIQUEIDENTIFIER,
    @uid [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.Query AS Q
    WHERE Q.UniversalId = @queryuid;

    -- convert conceptuid to conceptid
    DECLARE @conceptid UNIQUEIDENTIFIER
    SELECT TOP 1 @conceptid = Id
    FROM app.Concept AS C
    WHERE C.UniversalId = @uid

    EXEC app.sp_GetConceptDatasetContextById @qid, @conceptid, @user, @groups, @admin
END
GO