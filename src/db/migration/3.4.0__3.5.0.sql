USE [LeafDB]
GO

/*
 * Update version.
 */
IF EXISTS (SELECT 1 FROM [ref].[Version])
    UPDATE ref.Version
    SET [Version] = '3.5.0'
ELSE 
    INSERT INTO ref.[Version] (Lock, Version)
    SELECT 'X', '3.5.0'

/* 
 * ref.ImportType
 */
CREATE TABLE ref.ImportType
(
    Id INT NOT NULL,
    Variant NVARCHAR(100) NOT NULL
    CONSTRAINT [PK_Import_1] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO ref.ImportType (Id, Variant)
VALUES (1, 'REDCap Project'), (2, 'MRN')

/* 
 * app.ImportMetadata
 */
CREATE TABLE app.ImportMetadata
(
    [Id] UNIQUEIDENTIFIER NOT NULL,
	[SourceId] NVARCHAR(200) NOT NULL,
    [Structure] NVARCHAR(MAX) NOT NULL,
    [Type] INT NOT NULL,

    Created DATETIME NOT NULL,
    CreatedBy NVARCHAR(200) NOT NULL,
    Updated DATETIME NOT NULL,
    UpdatedBy NVARCHAR(200) NOT NULL,

    CONSTRAINT [PK_ImportMetadata_1] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [app].[ImportMetadata] ADD  CONSTRAINT [DF_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[ImportMetadata]  WITH CHECK ADD CONSTRAINT [FK_ImportMetadata_Type] FOREIGN KEY([Type]) REFERENCES [ref].[ImportType] ([Id])
GO
ALTER TABLE [app].[ImportMetadata] CHECK CONSTRAINT [FK_ImportMetadata_Type]
GO

/*
 * app.Import
 */
CREATE TABLE app.Import
(
    [Id] NVARCHAR(200) NOT NULL,
    [ImportMetadataId] UNIQUEIDENTIFIER NOT NULL,
    [PersonId] NVARCHAR(200) NOT NULL,
    [SourcePersonId] NVARCHAR(200) NOT NULL,
    [SourceValue] NVARCHAR(100) NOT NULL,
    [ValueString] NVARCHAR(100) NULL,
    [ValueNumber] DECIMAL(18,3) NULL,
    [ValueDate] DATETIME NULL,
    
    CONSTRAINT [PK_Import_1] PRIMARY KEY CLUSTERED 
(
    [Id] ASC,
    [ImportMetadataId] ASC,
    [PersonId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/*
 * auth.ImportMetadataConstraint
 */

CREATE TABLE [auth].[ImportMetadataConstraint](
	[ImportMetadataId] [uniqueidentifier] NOT NULL,
	[ConstraintId] [int] NOT NULL,
	[ConstraintValue] [nvarchar](1000) NOT NULL,
 CONSTRAINT [PK_ImportMetadataConstraint] PRIMARY KEY CLUSTERED 
(
	[ImportMetadataId] ASC,
	[ConstraintId] ASC,
	[ConstraintValue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [auth].[ImportMetadataConstraint]  WITH CHECK ADD  CONSTRAINT [FK_ImportMetadataConstraint_ConstraintId] FOREIGN KEY([ConstraintId])
REFERENCES [auth].[Constraint] ([Id])
GO

ALTER TABLE [auth].[ImportMetadataConstraint] CHECK CONSTRAINT [FK_ImportMetadataConstraint_ConstraintId]
GO

ALTER TABLE [auth].[ImportMetadataConstraint]  WITH CHECK ADD  CONSTRAINT [FK_ImportMetadataConstraint_ImportMetadataId] FOREIGN KEY([ImportMetadataId])
REFERENCES [app].[ImportMetadata] ([Id])
GO

ALTER TABLE [auth].[ImportMetadataConstraint] CHECK CONSTRAINT [FK_ImportMetadataConstraint_ImportMetadataId]
GO


/*
 * ImportDataTable Table Type.
 */
CREATE TYPE [app].[ImportDataTable] AS TABLE(
	Id NVARCHAR(200) NOT NULL,
	ImportMetadataId UNIQUEIDENTIFIER NOT NULL,
	PersonId NVARCHAR(100) NOT NULL,
	SourceValue NVARCHAR(100),
	ValueString NVARCHAR(100),
	ValueNumber DECIMAL(18,3),
	ValueDate DATETIME
)
GO

/*
 * [app].[sp_FilterImportMetadataByConstraint]
 */
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves all Import Metadata depending on user and groups.
-- =======================================
CREATE PROCEDURE [app].[sp_FilterImportMetadataByConstraint]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
	@requested app.ResourceIdTable READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (@admin = 1)
    BEGIN;
        SELECT Id
        FROM @requested;
        RETURN;
    END;

	SELECT
		IM.Id
	  , IM.SourceId
	  , IM.[Type]
	  , IM.Structure 
	FROM app.ImportMetadata AS IM
	WHERE EXISTS (SELECT 1 FROM @requested AS R WHERE IM.Id = R.Id)
		  AND 
			(NOT EXISTS (SELECT 1 FROM auth.ImportMetadataConstraint AS C WHERE IM.Id = C.ImportMetadataId) -- Not constrained
			  OR EXISTS (SELECT 1 
						 FROM auth.ImportMetadataConstraint AS C 
						 WHERE IM.Id = C.ImportMetadataId
							   AND (
										(C.ConstraintId = 1 AND C.ConstraintValue = @user)								   -- Constrained by user
									 OR (C.ConstraintId = 2 AND C.ConstraintValue IN (SELECT G.[Group] FROM @groups AS G)) -- Constrained by group
								   )
					    )
			)
END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves all Import Metadata depending on user and groups.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportMetadata]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @requested app.ResourceIdTable;

	INSERT INTO @requested
	SELECT Id
	FROM app.ImportMetadata

	EXEC app.sp_FilterImportMetadataByConstraint @user, @groups, @requested, @admin

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves Import Metadata by SourceId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportMetadataBySourceId]
	@sourceId nvarchar(100),
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @requested app.ResourceIdTable;

	INSERT INTO @requested
	SELECT Id
	FROM app.ImportMetadata AS IM
	WHERE IM.SourceId = @sourceId

	EXEC app.sp_FilterImportMetadataByConstraint @user, @groups, @requested, @admin

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves Import Metadata by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportMetadataById]
	@id uniqueidentifier,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @requested app.ResourceIdTable;

	INSERT INTO @requested
	SELECT Id
	FROM app.ImportMetadata AS IM
	WHERE IM.Id = @id

	EXEC app.sp_FilterImportMetadataByConstraint @user, @groups, @requested, @admin

END