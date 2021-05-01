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
 * [app].[Visualization]
 */
IF OBJECT_ID('app.VisualizationPage') IS NOT NULL
	DROP TABLE [app].[VisualizationPage];
GO

CREATE TABLE [app].[VisualizationPage](
	[Id] [uniqueidentifier] NOT NULL,
    [PageName] [nvarchar](100) NOT NULL,
    [PageDescription] nvarchar(1000) NOT NULL,
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
 * FKs
 */
ALTER TABLE [app].[VisualizationComponent]  WITH CHECK ADD CONSTRAINT [FK_VisualizationComponent_VisualizationPageId] FOREIGN KEY([VisualizationPageId])
REFERENCES [app].[VisualizationPage] ([Id])
GO

ALTER TABLE [app].[VisualizationComponent] CHECK CONSTRAINT [FK_VisualizationComponent_VisualizationPageId]
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
    FROM app.VisualizationPage AS VP
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
    FROM #VC AS VC
         INNER JOIN rela.VisualizationComponentDatasetQuery AS VCDQ
            ON VC.Id = VCDQ.VisualizationComponentId
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
    FROM rela.VisualizationComponentDatasetQuery AS VCDQ

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
            Header nvarchar(100) NOT NULL,
            SubHeader nvarchar(1000) NULL,
            OrderId int NOT NULL,
            Created datetime NOT NULL,
            CreatedBy nvarchar(1000) NOT NULL,
            Updated datetime NOT NULL,
            UpdatedBy nvarchar(1000) NOT NULL
        );

        INSERT INTO app.VisualizationPage (PageName, PageDescription, OrderId, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.PageName, inserted.PageDescription, inserted.OrderId, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy
        INTO @ins
        VALUES (@name, @description, @orderid, GETDATE(), @user, GETDATE(), @user);

        DECLARE @id UNIQUEIDENTIFIER;
        SELECT TOP 1 @id = Id from @ins;

        SELECT
            Id,
            Header,
            SubHeader,
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

        INSERT INTO app.VisualizationComponent (VisualizationPageId, Header, SubHeader, JsonSpec, IsFullWidth, OrderId)
        OUTPUT inserted.VisualizationPageId, inserted.Id, inserted.Header, inserted.SubHeader, inserted.JsonSpec, inserted.IsFullWidth, inserted.OrderId
        INTO @comps
        SELECT @visualizationpageid, @header, @subheader, @jsonSpec, @isFullWidth, @orderId

        DECLARE @componentid UNIQUEIDENTIFIER;
        SELECT TOP 1 @componentid = Id from @comps;

        INSERT INTO rela.VisualizationComponentDatasetQuery (VisualizationComponentId, DatasetQueryId)
        OUTPUT inserted.VisualizationComponentId, inserted.DatasetQueryId
        SELECT @componentid, Id
        FROM @datasetids

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
            OrderId = @orderid,
            Updated = GETDATE(),
            UpdatedBy = @user
        OUTPUT
            inserted.Id,
            inserted.PageName,
            inserted.PageDescription,
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