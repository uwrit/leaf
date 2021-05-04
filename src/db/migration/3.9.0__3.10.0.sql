/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.10.0'
GO

/**
 * [rela].[VisualizationComponentDatasetQuery]
 */
IF OBJECT_ID('rela.VisualizationComponentDatasetQuery') IS NOT NULL
	DROP TABLE [rela].[VisualizationComponentDatasetQuery];
GO

CREATE TABLE [rela].[VisualizationComponentDatasetQuery](
	[VisualizationComponentId] [uniqueidentifier] NOT NULL,
    [DatasetQueryId] [uniqueidentifier] NOT NULL
 CONSTRAINT [PK__VisualizationComponentDatasetQuery] PRIMARY KEY CLUSTERED 
(
	[VisualizationComponentId] ASC,
    [DatasetQueryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] 
GO

/**
 * [auth].[VisualizationPageConstraint]
 */
IF OBJECT_ID('auth.VisualizationPageConstraint') IS NOT NULL
	DROP TABLE [auth].[VisualizationPageConstraint];
GO

CREATE TABLE [auth].[VisualizationPageConstraint](
	[VisualizationPageId] [uniqueidentifier] NOT NULL,
	[ConstraintId] [int] NOT NULL,
	[ConstraintValue] [nvarchar](1000) NOT NULL
CONSTRAINT [PK__VisualizationComponentDatasetQuery] PRIMARY KEY CLUSTERED 
(
	[VisualizationPageId] ASC,
    [ConstraintId] ASC,
    [ConstraintValue] ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/**
 * [app].[VisualizationComponent]
 */
IF OBJECT_ID('app.VisualizationComponent') IS NOT NULL
	DROP TABLE [app].[VisualizationComponent];
GO

CREATE TABLE [app].[VisualizationComponent](
	[Id] [uniqueidentifier] NOT NULL,
    [VisualizationPageId] [uniqueidentifier] NOT NULL,
    [Header] [nvarchar](100) NOT NULL,
    [SubHeader] [nvarchar](1000) NULL,
    [JsonSpec] [nvarchar](max) NOT NULL,
    [IsFullWidth] BIT NOT NULL,
    [OrderId] [int] NOT NULL
 CONSTRAINT [PK__VisualizationComponent] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] 
GO

ALTER TABLE [app].[VisualizationComponent] ADD  CONSTRAINT [DF_VisualizationComponent_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO

/**
 * [app].[VisualizationPage]
 */
IF OBJECT_ID('app.VisualizationPage') IS NOT NULL
	DROP TABLE [app].[VisualizationPage];
GO

CREATE TABLE [app].[VisualizationPage](
	[Id] [uniqueidentifier] NOT NULL,
    [PageName] [nvarchar](100) NOT NULL,
    [PageDescription] nvarchar(1000) NOT NULL,
    [CategoryId] uniqueidentifier NULL,
    [OrderId] [int] NOT NULL,
    [Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL
 CONSTRAINT [PK__VisualizationPage] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [app].[VisualizationPage] ADD  CONSTRAINT [DF_VisualizationPage_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[VisualizationPage] ADD  CONSTRAINT [DF_VisualizationPage_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[VisualizationPage] ADD  CONSTRAINT [DF_VisualizationPage_Updated]  DEFAULT (getdate()) FOR [Updated]
GO

/**
 * [app].[VisualizationCategory]
 */
IF OBJECT_ID('app.VisualizationCategory') IS NOT NULL
	DROP TABLE [app].[VisualizationCategory];
GO

CREATE TABLE [app].[VisualizationCategory](
	[Id] [uniqueidentifier] NOT NULL,
    [Category] [nvarchar](100) NOT NULL,
    [Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL
 CONSTRAINT [PK__VisualizationCategory] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] 
GO

CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_VisualizationCategory_Category] ON [app].[VisualizationCategory]
(
	[Category] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

ALTER TABLE [app].[VisualizationCategory] ADD  CONSTRAINT [DF_VisualizationCategory_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[VisualizationCategory] ADD  CONSTRAINT [DF_VisualizationCategory_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[VisualizationCategory] ADD  CONSTRAINT [DF_VisualizationCategory_Updated]  DEFAULT (getdate()) FOR [Updated]
GO

/**
 * FKs
 */
ALTER TABLE [app].[VisualizationComponent]  WITH CHECK ADD CONSTRAINT [FK_VisualizationComponent_VisualizationPageId] FOREIGN KEY([VisualizationPageId])
REFERENCES [app].[VisualizationPage] ([Id])
GO

ALTER TABLE [app].[VisualizationComponent] CHECK CONSTRAINT [FK_VisualizationComponent_VisualizationPageId]
GO

ALTER TABLE [app].[VisualizationPage]  WITH CHECK ADD CONSTRAINT [FK_VisualizationPage_CategoryId] FOREIGN KEY([CategoryId])
REFERENCES [app].[VisualizationCategory] ([Id])
GO

ALTER TABLE [app].[VisualizationPage] CHECK CONSTRAINT [FK_VisualizationPage_CategoryId]
GO

ALTER TABLE [rela].[VisualizationComponentDatasetQuery]  WITH CHECK ADD CONSTRAINT [FK_PK__VisualizationComponentDatasetQuery_VisualizationComponentId] FOREIGN KEY([VisualizationComponentId])
REFERENCES [app].[VisualizationComponent] ([Id])
GO

ALTER TABLE [rela].[VisualizationComponentDatasetQuery] CHECK CONSTRAINT [FK_PK__VisualizationComponentDatasetQuery_VisualizationComponentId]
GO

ALTER TABLE [rela].[VisualizationComponentDatasetQuery]  WITH CHECK ADD CONSTRAINT [FK_PK__VisualizationComponentDatasetQuery_DatasetQueryId] FOREIGN KEY([DatasetQueryId])
REFERENCES [app].[DatasetQuery] ([Id])
GO

ALTER TABLE [rela].[VisualizationComponentDatasetQuery] CHECK CONSTRAINT [FK_PK__VisualizationComponentDatasetQuery_DatasetQueryId]
GO

ALTER TABLE [auth].[VisualizationPageConstraint]  WITH CHECK ADD  CONSTRAINT [FK_VisualizationPageConstraint_ConstraintId] FOREIGN KEY([ConstraintId])
REFERENCES [auth].[Constraint] ([Id])
GO

ALTER TABLE [auth].[VisualizationPageConstraint] CHECK CONSTRAINT [FK_VisualizationPageConstraint_ConstraintId]
GO

ALTER TABLE [auth].[VisualizationPageConstraint]  WITH CHECK ADD  CONSTRAINT [FK_VisualizationPageConstraint_VisualizationPageId] FOREIGN KEY([VisualizationPageId])
REFERENCES [app].[VisualizationPage] ([Id])
GO

ALTER TABLE [auth].[VisualizationPageConstraint] CHECK CONSTRAINT [FK_VisualizationPageConstraint_VisualizationPageId]
GO

/*
 * [app].[sp_GetVisualizationPages]
 */
IF OBJECT_ID('app.sp_GetVisualizationPages', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetVisualizationPages];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/04/28
-- Description: Retrieves all VisualizationPage records to which the user is authorized.
-- =======================================
CREATE PROCEDURE [app].[sp_GetVisualizationPages]
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
        SELECT VP.Id
        FROM app.VisualizationPage AS VP
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
        INSERT INTO @ids (Id)
        SELECT
            VP.Id
        FROM app.VisualizationPage AS VP
        WHERE NOT EXISTS (
                SELECT 1
                FROM auth.VisualizationPageConstraint AS VPC
                WHERE VPC.VisualizationPageId = VP.Id
            )
            OR EXISTS (
                SELECT 1
                FROM auth.VisualizationPageConstraint AS VPC
                WHERE VPC.VisualizationPageId = VP.Id
                      AND ConstraintId = 1
                      AND ConstraintValue = @user
                UNION ALL
                SELECT 1
                FROM auth.VisualizationPageConstraint AS VPC
                WHERE VPC.VisualizationPageId = VP.Id
                      AND ConstraintId = 2
                      AND ConstraintValue IN (SELECT [Group] FROM @groups)
        );
    END;

    -- Prep components for each visualization page
    SELECT
        VC.Id
      , VC.VisualizationPageId
      , VC.Header
      , VC.SubHeader
      , VC.JsonSpec
      , VC.IsFullWidth
      , VC.OrderId
      , DatasetDependencyCount = (SELECT COUNT(*) FROM rela.VisualizationComponentDatasetQuery AS VCDQ WHERE VC.Id = VCDQ.VisualizationComponentId)
      , AllowedDependencyCount = 0
    INTO #VC
    FROM app.VisualizationComponent AS VC
    WHERE EXISTS (SELECT 1 FROM @ids AS I WHERE VC.VisualizationPageId = I.Id)

    DECLARE @datasetids TABLE (
        Id UNIQUEIDENTIFIER NOT NULL
    );

    IF (@admin = 1)
    BEGIN;
        -- user is an admin, load them all
        INSERT INTO @datasetids
        SELECT DQ.Id
        FROM app.DatasetQuery AS DQ
             INNER JOIN rela.VisualizationComponentDatasetQuery AS VCDQ
                ON DQ.Id = VCDQ.DatasetQueryId
        WHERE EXISTS (SELECT 1 FROM #VC AS VC WHERE VC.Id = VCDQ.VisualizationComponentId)
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
        INSERT INTO @datasetids (Id)
        SELECT
            DQ.Id
        FROM app.DatasetQuery AS DQ
             INNER JOIN rela.VisualizationComponentDatasetQuery AS VCDQ
                ON DQ.Id = VCDQ.DatasetQueryId
        WHERE EXISTS (SELECT 1 FROM #VC AS VC WHERE VC.Id = VCDQ.VisualizationComponentId)
              AND NOT EXISTS (
                SELECT 1
                FROM auth.DatasetQueryConstraint AS DQC
                WHERE DQC.DatasetQueryId = dq.Id
              ) 
              OR EXISTS (
                SELECT 1
                FROM auth.DatasetQueryConstraint AS DQC
                WHERE DQC.DatasetQueryId = DQ.Id 
                      AND DQC.ConstraintId = 1
                      AND DQC.ConstraintValue = @user
                UNION ALL
                SELECT 1
                FROM auth.DatasetQueryConstraint AS DQC
                WHERE DQC.DatasetQueryId = DQ.Id
                      AND DQC.ConstraintId = 2
                      AND DQC.ConstraintValue IN (SELECT [Group] FROM @groups)
              );
        
    END;

    -- Check the number of datasets for each visualization that are allowed
    UPDATE #VC
    SET AllowedDependencyCount = (SELECT COUNT(*) 
                                  FROM @datasetids AS I 
                                       INNER JOIN rela.VisualizationComponentDatasetQuery AS VCDQ
                                            ON I.Id = VCDQ.VisualizationComponentId
                                  WHERE VCDQ.VisualizationComponentId = VC.Id)
    FROM #VC AS VC

    -- If the user is missing permissions for at least one required dataset,
    -- remove the component
    DELETE #VC 
    FROM #VC AS VC
    WHERE VC.DatasetDependencyCount != VC.AllowedDependencyCount

    -- produce the hydrated visualization pages
    SELECT
        VP.Id
      , VP.PageName
      , VP.PageDescription
      , VP.OrderId
      , VCAT.Category
    FROM app.VisualizationPage AS VP
         LEFT JOIN app.VisualizationCategory AS VCAT
            ON VP.CategoryId = VCAT.Id
    WHERE EXISTS (SELECT 1 FROM @ids AS I WHERE VP.Id = I.Id)

    -- produce visualization components
    SELECT
        VC.Id
      , VC.VisualizationPageId
      , VC.Header
      , VC.SubHeader
      , VC.JsonSpec
      , VC.IsFullWidth
      , VC.OrderId
    FROM #VC AS VC
    WHERE EXISTS (SELECT 1 FROM @ids AS I WHERE VC.VisualizationPageId = I.Id)

    -- produce dependent dataset IDs
    SELECT
        VC.VisualizationPageId
      , VCDQ.VisualizationComponentId
      , VCDQ.DatasetQueryId
      , DQ.UniversalId
      , DatasetName = DQ.[Name]
    FROM #VC AS VC
         INNER JOIN rela.VisualizationComponentDatasetQuery AS VCDQ
            ON VC.Id = VCDQ.VisualizationComponentId
         INNER JOIN app.DatasetQuery AS DQ
            ON VCDQ.DatasetQueryId = DQ.Id
    WHERE EXISTS (SELECT 1 FROM @ids AS I WHERE VC.VisualizationPageId = I.Id)

END
GO

/**
 * [adm].[sp_CreateVisualizationPage], [adm].[sp_UpdateVisualizationPage] & [app].[VisualizationComponentTable]
 */
IF OBJECT_ID('adm.sp_CreateVisualizationPage', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateVisualizationPage]
GO

IF OBJECT_ID('adm.sp_CreateVisualizationComponent', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateVisualizationComponent]
GO

IF OBJECT_ID('adm.sp_UpdateVisualizationPage', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateVisualizationPage]
GO

IF TYPE_ID('[app].[VisualizationComponentTable]') IS NOT NULL
	DROP TYPE [app].[VisualizationComponentTable];
GO
CREATE TYPE [app].[VisualizationComponentTable] AS TABLE (
    [Header] [nvarchar](100) NOT NULL,
    [SubHeader] [nvarchar](1000) NOT NULL,
    [JsonSpec] [nvarchar](max) NOT NULL,
    [IsFullWidth] BIT NOT NULL,
    [OrderId] [int] NOT NULL
)
GO

/*
 * [adm].[sp_GetVisualizationPages]
 */
IF OBJECT_ID('adm.sp_GetVisualizationPages', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetVisualizationPages];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/04/30
-- Description: Retrieves all VisualizationPage records for an admin
-- =======================================
CREATE PROCEDURE [adm].[sp_GetVisualizationPages]
AS
BEGIN
    SET NOCOUNT ON

    -- Get visualization pages
    SELECT
        VP.Id
      , VP.PageName
      , VP.PageDescription
      , VP.CategoryId
      , VP.OrderId
      , VP.Created
      , VP.CreatedBy
      , VP.Updated
      , VP.UpdatedBy
    FROM app.VisualizationPage AS VP

    -- Get components for each visualization page
    SELECT
        VC.Id
      , VC.VisualizationPageId
      , VC.Header
      , VC.SubHeader
      , VC.JsonSpec
      , VC.IsFullWidth
      , VC.OrderId
    FROM app.VisualizationComponent AS VC

    -- Get visualization component dataset Ids
    SELECT
        VCDQ.VisualizationComponentId
      , VCDQ.DatasetQueryId
      , DQ.UniversalId
      , DatasetName = DQ.[Name]
    FROM rela.VisualizationComponentDatasetQuery AS VCDQ
         INNER JOIN app.DatasetQuery AS DQ
            ON VCDQ.DatasetQueryId = DQ.Id

    -- Get constraints
    SELECT
        VPC.ConstraintId
      , VPC.ConstraintValue
      , VPC.VisualizationPageId
    FROM auth.VisualizationPageConstraint AS VPC

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-04-28
-- Description: Create a Visualization Page
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateVisualizationPage]
    @name nvarchar(100),
    @description nvarchar(1000),
    @categoryid uniqueidentifier,
    @orderid int,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'VisualizationPage.Name is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        DECLARE @ins TABLE (
            Id uniqueidentifier,
            PageName nvarchar(100) NOT NULL,
            PageDescription nvarchar(1000) NULL,
            CategoryId uniqueidentifier NULL,
            OrderId int NOT NULL,
            Created datetime NOT NULL,
            CreatedBy nvarchar(1000) NOT NULL,
            Updated datetime NOT NULL,
            UpdatedBy nvarchar(1000) NOT NULL
        );

        INSERT INTO app.VisualizationPage (PageName, PageDescription, CategoryId, OrderId, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.PageName, inserted.PageDescription, inserted.CategoryId, inserted.OrderId, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy
        INTO @ins
        VALUES (@name, @description, @categoryid, @orderid, GETDATE(), @user, GETDATE(), @user);

        DECLARE @id UNIQUEIDENTIFIER;
        SELECT TOP 1 @id = Id from @ins;

        SELECT
            Id,
            PageName,
            PageDescription,
            CategoryId,
            OrderId,
            Created,
            CreatedBy,
            Updated,
            UpdatedBy
        FROM @ins;

        INSERT INTO auth.VisualizationPageConstraint (VisualizationPageId, ConstraintId, ConstraintValue)
        OUTPUT inserted.VisualizationPageId, inserted.ConstraintId, inserted.ConstraintValue
        SELECT @id, ConstraintId, ConstraintValue
        FROM @constraints;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-04-28
-- Description: Create a Visualization Component
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateVisualizationComponent]
    @visualizationpageid uniqueidentifier,
    @header nvarchar(100),
    @subheader nvarchar(1000),
    @jsonSpec nvarchar(MAX),
    @isFullWidth bit,
    @orderId int,
    @datasetids app.ResourceIdTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF (app.fn_NullOrWhitespace(@header) = 1)
        THROW 70400, N'VisualizationComponent.Header is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        DECLARE @comps TABLE (
            VisualizationPageId uniqueidentifier NOT NULL, 
            Id uniqueidentifier NOT NULL,
            Header NVARCHAR(100) NOT NULL, 
            SubHeader NVARCHAR(1000) NULL,
            JsonSpec NVARCHAR(MAX) NOT NULL, 
            IsFullWidth BIT NOT NULL,
            OrderId INT NOT NULL
        )

        DECLARE @dqs TABLE (
            VisualizationComponentId uniqueidentifier NOT NULL,
            DatasetQueryId uniqueidentifier NOT NULL
        )

        INSERT INTO app.VisualizationComponent (VisualizationPageId, Header, SubHeader, JsonSpec, IsFullWidth, OrderId)
        OUTPUT inserted.VisualizationPageId, inserted.Id, inserted.Header, inserted.SubHeader, inserted.JsonSpec, inserted.IsFullWidth, inserted.OrderId
        INTO @comps
        SELECT @visualizationpageid, @header, @subheader, @jsonSpec, @isFullWidth, @orderId

        DECLARE @componentid UNIQUEIDENTIFIER;
        SELECT TOP 1 @componentid = Id from @comps;

        INSERT INTO rela.VisualizationComponentDatasetQuery (VisualizationComponentId, DatasetQueryId)
        OUTPUT inserted.VisualizationComponentId, inserted.DatasetQueryId
        INTO @dqs
        SELECT @componentid, Id
        FROM @datasetids

        SELECT
            VC.Id
          , VC.VisualizationPageId
          , VC.Header
          , VC.SubHeader
          , VC.JsonSpec
          , VC.IsFullWidth
          , VC.OrderId
        FROM @comps AS VC

        SELECT
            DQS.VisualizationComponentId
          , DQS.DatasetQueryId
          , DatasetQueryUniversalId = DQ.UniversalId
          , DatasetQueryName = DQ.[Name]
        FROM @dqs AS DQS
             INNER JOIN app.DatasetQuery AS DQ
                ON DQS.DatasetQueryId = DQ.Id

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-04-28
-- Description: Update a Visualization Page and 
--              delete any previous components
-- =======================================
CREATE PROCEDURE adm.sp_UpdateVisualizationPage
    @id uniqueidentifier,
    @name nvarchar(100),
    @description nvarchar(1000),
    @categoryid uniqueidentifier,
    @orderid int,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'VisualizationPage.Id is required.', 1;

    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'VisualizationPage.Name is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        IF NOT EXISTS (SELECT Id FROM app.VisualizationPage WHERE Id = @id)
            THROW 70404, N'VisualizationPage not found.', 1;

        UPDATE app.VisualizationPage
        SET
            PageName = @name,
            PageDescription = @description,
            CategoryId = @categoryid,
            OrderId = @orderid,
            Updated = GETDATE(),
            UpdatedBy = @user
        OUTPUT
            inserted.Id,
            inserted.PageName,
            inserted.PageDescription,
            inserted.CategoryId,
            inserted.OrderId,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        WHERE Id = @id;

        DELETE rela.VisualizationComponentDatasetQuery
        FROM rela.VisualizationComponentDatasetQuery AS VCDQ
             INNER JOIN app.VisualizationComponent AS VC
                ON VCDQ.VisualizationComponentId = VC.Id
        WHERE VC.VisualizationPageId = @id

        DELETE FROM auth.VisualizationPageConstraint
        WHERE VisualizationPageId = @id;

        DELETE FROM app.VisualizationComponent
        WHERE VisualizationPageId = @id;

        INSERT INTO auth.VisualizationPageConstraint (VisualizationPageId, ConstraintId, ConstraintValue)
        OUTPUT inserted.VisualizationPageId, inserted.ConstraintId, inserted.ConstraintValue
        SELECT @id, ConstraintId, ConstraintValue
        FROM @constraints;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO

IF OBJECT_ID('adm.sp_DeleteVisualizationPage', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_DeleteVisualizationPage]
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-04-28
-- Description: Delete a Visualization Page
-- =======================================
CREATE PROCEDURE adm.sp_DeleteVisualizationPage
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;
    BEGIN TRY
        DELETE FROM app.VisualizationComponent
        WHERE VisualizationPageId = @id;

		DELETE FROM auth.VisualizationPageConstraint
		WHERE VisualizationPageId = @id

        DELETE FROM app.VisualizationPage
        OUTPUT deleted.Id
        WHERE Id = @id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO

IF OBJECT_ID('adm.sp_GetVisualizationCategories', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetVisualizationCategories]
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/04/30
-- Description: Retrieves all VisualizationCategory records for an admin
-- =======================================
CREATE PROCEDURE [adm].[sp_GetVisualizationCategories]
AS
BEGIN
    SET NOCOUNT ON

    -- Get visualization categories
    SELECT
        VCAT.Id
      , VCAT.Category
    FROM app.VisualizationCategory AS VCAT

END
GO

IF OBJECT_ID('adm.sp_CreateVisualizationCategory', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateVisualizationCategory]
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-05-04
-- Description: Create a Visualization Category
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateVisualizationCategory]
    @category nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF (app.fn_NullOrWhitespace(@category) = 1)
        THROW 70400, N'VisualizationCategory.Category is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        IF EXISTS(SELECT Id FROM app.VisualizationCategory WHERE Category = @category)
            THROW 70409, N'VisualizationCategory already exists with that name.', 1;

        INSERT INTO app.VisualizationCategory (Category, CreatedBy, UpdatedBy)
        OUTPUT inserted.Id, inserted.Category, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy
        SELECT @category, @user, @user

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO

IF OBJECT_ID('adm.sp_UpdateVisualizationCategory', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateVisualizationCategory]
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-05-04
-- Description: Update a Visualization Category
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateVisualizationCategory]
    @id uniqueidentifier,
    @category nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF (@id IS NULL)
        THROW 70400, N'VisualizationCategory.Id is required.', 1;

    IF (app.fn_NullOrWhitespace(@category) = 1)
        THROW 70400, N'VisualizationCategory.Category is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM app.VisualizationCategory WHERE Id = @id)
            THROW 70404, N'VisualizationCategory not found.', 1;

        IF EXISTS (SELECT Id FROM app.VisualizationCategory WHERE Id != @id AND Category = @category)
            THROW 70409, N'VisualizationCategory already exists with that name.', 1;

        UPDATE app.VisualizationCategory
        SET
            Category = @category,
            Updated = GETDATE(),
            UpdatedBy = @user
        OUTPUT
            inserted.Id,
            inserted.Category,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        WHERE Id = @id

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO

IF OBJECT_ID('adm.sp_DeleteVisualizationCategory', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_DeleteVisualizationCategory]
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021-05-04
-- Description: Delete a Visualization Category
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteVisualizationCategory]
    @id uniqueidentifier,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF NOT EXISTS(SELECT 1 FROM app.VisualizationCategory WHERE Id = @id)
        THROW 70404, N'VisualizationCategory not found.', 1;
    
    BEGIN TRAN;

    DECLARE @deps TABLE (
        Id uniqueidentifier not null
    );
    INSERT INTO @deps (Id)
    SELECT Id
    FROM app.VisualizationPage
    WHERE CategoryId = @id;

    IF EXISTS (SELECT 1 FROM @deps)
    BEGIN;
        -- there are dependents, bail
        ROLLBACK;

        SELECT Id
        FROM @deps;

        RETURN;
    END;

    DELETE FROM app.VisualizationCategory
    WHERE Id = @id;

    COMMIT;

    -- No dependents.
    SELECT Id = NULL
    WHERE 0 = 1;

END
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Delete an app.DatasetQuery.
-- =======================================
ALTER PROCEDURE [adm].[sp_DeleteDatasetQuery]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;

    IF NOT EXISTS(SELECT 1 FROM app.DatasetQuery WHERE Id = @id)
        BEGIN;
            THROW 70404, N'DatasetQuery not found.', 1;
        END;

    declare @vizcomponents table (
        Id uniqueidentifier,
        Header nvarchar(100)
    );
    INSERT INTO @vizcomponents
    SELECT VCDQ.VisualizationComponentId, VC.Header
    FROM rela.VisualizationComponentDatasetQuery AS VCDQ
         INNER JOIN app.VisualizationComponent AS VC
            ON VCDQ.VisualizationComponentId = VC.Id
    WHERE VCDQ.DatasetQueryId = @id;

    IF NOT EXISTS (SELECT 1 FROM @vizcomponents)
    BEGIN;
        BEGIN TRY

            DELETE FROM app.DatasetQueryTag
            WHERE DatasetQueryId = @id;

            DELETE FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = @id

            DELETE FROM app.DynamicDatasetQuery
            WHERE Id = @id

            DELETE FROM app.DatasetQuery
            OUTPUT deleted.Id
            WHERE Id = @id;

            COMMIT;

            SELECT Id = NULL, Header = NULL
            WHERE 0 = 1;

        END TRY
        BEGIN CATCH

            ROLLBACK;

            SELECT Id = NULL
            WHERE 0 = 1;

            SELECT Id, Header
            FROM @vizcomponents;

        END CATCH;
    END;
END
GO