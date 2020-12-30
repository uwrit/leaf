/**
 * Update version.
 */
UPDATE ref.[Version]
SET [Version] = '3.9.0'
GO

/**
 * Add Concept Dataset schema
 */
DECLARE @ConceptDatasetShapeId INT = -2
IF NOT EXISTS (SELECT 1 FROM ref.Shape WHERE Id = @ConceptDatasetShapeId)
BEGIN
    INSERT INTO ref.Shape (Id, Variant, [Schema])
    SELECT @ConceptDatasetShapeId, 'Concept', '{"fields":[{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"dateField","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"numberField","type":"Numeric","phi":false,"mask":false,"required":false}]}'
END

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
-- Description: Retrieves the Query by Id and Concept by Id.
-- =======================================
IF OBJECT_ID('app.sp_GetConceptDatasetContextByQueryIdConceptId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptDatasetContextByQueryIdConceptId];
GO
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextByQueryIdConceptId]
    @queryid UNIQUEIDENTIFIER,
    @conceptid UNIQUEIDENTIFIER,
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

    SELECT
        QueryId = Id,
        Pepper
    FROM app.Query
    WHERE Id = @queryid;

    -- concept
    EXEC app.sp_GetConceptById @conceptid, @user, @groups, @admin
END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the Query by Id and Concept by UId.
-- =======================================
IF OBJECT_ID('app.sp_GetConceptDatasetContextByQueryIdConceptUId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptDatasetContextByQueryIdConceptUId];
GO
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextByQueryIdConceptUId]
    @queryid UNIQUEIDENTIFIER,
    @conceptuid UNIQUEIDENTIFIER,
    @user auth.[User] = NULL,
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- convert conceptuid to conceptid
    DECLARE @conceptid UNIQUEIDENTIFIER
    SELECT TOP 1 @conceptid = Id
    FROM app.Concept AS C
    WHERE C.UniversalId = @conceptuid

    EXEC app.sp_GetConceptDatasetContextByQueryIdConceptId @queryid, @conceptid, @user, @groups, @admin
END
GO

IF OBJECT_ID('app.sp_GetConceptDatasetContextByQueryUIdConceptUId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptDatasetContextByQueryUIdConceptUId];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the Query by UId and Concept by UId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextByQueryUIdConceptUId]
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

    EXEC app.sp_GetConceptDatasetContextByQueryIdConceptId @qid, @conceptid, @user, @groups, @admin
END
GO

IF OBJECT_ID('app.sp_GetConceptDatasetContextByQueryUIdConceptId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetConceptDatasetContextByQueryUIdConceptId];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the Query by UId and Concept by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextByQueryUIdConceptId]
    @queryuid UNIQUEIDENTIFIER,
    @conceptid [uniqueidentifier],
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

    EXEC app.sp_GetConceptDatasetContextByQueryIdConceptId @qid, @conceptid, @user, @groups, @admin
END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the app.Query.Pepper and JSON Definition by ID.
-- =======================================
IF OBJECT_ID('app.sp_GetContextById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetContextById];
GO
CREATE PROCEDURE [app].[sp_GetContextById]
    @queryid UNIQUEIDENTIFIER,
    @user auth.[User] = NULL,
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

    SELECT
        QueryId = Id,
        Pepper,
        Definition
    FROM app.Query
    WHERE Id = @queryid;

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the app.Query.Pepper and JSON Definition by UID.
-- =======================================
IF OBJECT_ID('app.sp_GetContextByUId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetContextByUId];
GO
CREATE PROCEDURE [app].[sp_GetContextByUId]
    @queryuid UNIQUEIDENTIFIER,
    @user auth.[User] = NULL,
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

    EXEC [app].[sp_GetContextById] @qid, @user, @groups, @admin

END
GO