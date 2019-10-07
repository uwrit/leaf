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
	[SourceModifier] NVARCHAR(100) NOT NULL,
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
	SourcePersonId NVARCHAR(100) NOT NULL,
	SourceValue NVARCHAR(100),
	[SourceModifier] [nvarchar](100) NULL,
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
        SELECT
			IM.Id
		  , IM.SourceId
		  , IM.Structure 
		  , IM.[Type]
		FROM app.ImportMetadata AS IM
		WHERE EXISTS (SELECT 1 FROM @requested AS R WHERE IM.Id = R.Id)
        RETURN;
    END;

	SELECT
		IM.Id
	  , IM.SourceId
	  , IM.Structure 
	  , IM.[Type]
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
	FROM app.ImportMetadata;

	DECLARE @meta TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100));

	INSERT INTO @meta (Id, SourceId, Structure, [Type])
	EXEC app.sp_FilterImportMetadataByConstraint @user, @groups, @requested, @admin;

	INSERT INTO @cons (ImportMetadataId, ConstraintId, ConstraintValue)
	SELECT
		ImportMetadataId
	  , ConstraintId
	  , ConstraintValue
	FROM auth.ImportMetadataConstraint AS IMC
	WHERE EXISTS (SELECT 1 FROM @meta AS M WHERE M.Id = IMC.ImportMetadataId);

	SELECT * FROM @meta;
	SELECT * FROM @cons;

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
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Creates an Import Metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_CreateImportMetadata]
    @user auth.[User],
	@constraints auth.ResourceConstraintTable READONLY,
	@sourceId nvarchar(100),
	@type int,
	@structure nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM ref.ImportType AS IT WHERE @type = IT.Id))
    BEGIN;
        THROW 70404, N'ImportType does not exist.', 1;
    END;

	IF (app.fn_NullOrWhitespace(@sourceId) = 1)
        THROW 70400, N'SourceId is required.', 1;

	IF (app.fn_NullOrWhitespace(@structure) = 1)
        THROW 70400, N'Structure is required.', 1;

	DECLARE @created TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100));

	-- INSERT metadata row
	INSERT INTO app.ImportMetadata (SourceId, [Type], Structure, Created, CreatedBy, Updated, UpdatedBy)
	OUTPUT inserted.Id, inserted.SourceId, inserted.Structure, inserted.[Type] INTO @created
	VALUES (@sourceId, @type, @structure, GETDATE(), @user, GETDATE(), @user);

	DECLARE @id uniqueidentifier = (SELECT TOP 1 Id FROM @created);

	-- INSERT contraints
	INSERT INTO auth.ImportMetadataConstraint (ImportMetadataId, ConstraintId, ConstraintValue)
	OUTPUT inserted.ImportMetadataId, inserted.ConstraintId, inserted.ConstraintValue INTO @cons
	SELECT
		ImportMetadataId = @id
	  , C.ConstraintId
	  , C.ConstraintValue
	FROM @constraints AS C;

	SELECT * FROM @created;
	SELECT * FROM @cons;

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Updates an Import Metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_UpdateImportMetadata]
	@id uniqueidentifier,
	@sourceId nvarchar(100),
	@type int,
	@structure nvarchar(max),
	@constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User],
	@groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM ref.ImportType AS IT WHERE @type = IT.Id))
    BEGIN;
        THROW 70404, N'ImportType does not exist.', 1;
    END;

	IF (app.fn_NullOrWhitespace(@sourceId) = 1)
        THROW 70400, N'SourceId is required.', 1;

	IF (app.fn_NullOrWhitespace(@structure) = 1)
        THROW 70400, N'Structure is required.', 1;

	DECLARE @updated TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100))

	-- Confirm user allowed to UPDATE
	DECLARE @allowed app.ResourceIdTable;

	INSERT INTO @allowed (Id)
	EXEC app.sp_GetImportMetadata @user, @groups, @admin

	IF (NOT EXISTS (SELECT 1 FROM @allowed WHERE Id = @id))
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to to alter import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	-- INSERT metadata row
	UPDATE TOP (1) app.ImportMetadata 
	SET 
		SourceId = @id
	  , [Type] = @type
	  , Structure = @structure
	  , Updated = GETDATE()
	  , UpdatedBy = @user
	OUTPUT inserted.Id, inserted.SourceId, inserted.Structure, inserted.[Type] INTO @updated
	WHERE Id = @id;

	-- DELETE any previous constraints
	DELETE auth.ImportMetadataConstraint
	WHERE ImportMetadataId = @id;

	-- INSERT contraints
	INSERT INTO auth.ImportMetadataConstraint (ImportMetadataId, ConstraintId, ConstraintValue)
	OUTPUT inserted.ImportMetadataId, inserted.ConstraintId, inserted.ConstraintValue INTO @cons
	SELECT
		ImportMetadataId = @id
	  , C.ConstraintId
	  , C.ConstraintValue
	FROM @constraints AS C;

	SELECT * FROM @updated;
	SELECT * FROM @cons;

END
GO


-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Deletes an Import Metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_DeleteImportMetadata]
	@id uniqueidentifier,
    @user auth.[User],
	@groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM app.ImportMetadata AS IT WHERE @id = IT.Id))
    BEGIN;
        THROW 70404, N'ImportMetadata does not exist.', 1;
    END;

	-- Confirm user allowed to DELETE
	DECLARE @allowed app.ResourceIdTable;

	INSERT INTO @allowed (Id)
	EXEC app.sp_GetImportMetadata @user, @groups, @admin

	IF (NOT EXISTS (SELECT 1 FROM @allowed WHERE Id = @id))
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to to alter import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	DECLARE @deleted TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100))

	-- DELETE any constraints
	DELETE auth.ImportMetadataConstraint
	OUTPUT deleted.ImportMetadataId, deleted.ConstraintId, deleted.ConstraintValue INTO @cons
	WHERE ImportMetadataId = @id;

	-- DELETE any imported data
	DELETE app.Import
	WHERE ImportMetadataId = @id

	-- DELETE metadata
	DELETE app.ImportMetadata
	OUTPUT deleted.Id, deleted.SourceId, deleted.Structure, deleted.[Type] INTO @deleted
	WHERE Id = @id;

	SELECT * FROM @deleted;
	SELECT * FROM @cons;

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Adds import records tied to a metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_ImportData]
	@id uniqueidentifier,
	@data [app].[ImportDataTable] READONLY,
    @user auth.[User],
	@groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM app.ImportMetadata AS IT WHERE @id = IT.Id))
    BEGIN;
        THROW 70404, N'ImportMetadata does not exist.', 1;
    END;

	/*
	-- Confirm user allowed to add data for this metadata
	DECLARE @allowed app.ResourceIdTable;

	INSERT INTO @allowed (Id)
	EXEC app.sp_GetImportMetadata @user, @groups, @admin

	IF (NOT EXISTS (SELECT 1 FROM @allowed WHERE Id = @id))
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to add data to import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;
	*/

	DECLARE @changed INT = 0;

	-- Check for UPDATEs
	UPDATE app.Import
	SET
		PersonId = D.PersonId
	  , SourcePersonId = D.SourcePersonId
	  , SourceValue = D.SourceValue
	  , SourceModifier = D.SourceModifier
	  , ValueString = D.ValueString
	  , ValueNumber = D.ValueNumber
	  , ValueDate = D.ValueDate
	FROM @data AS D
		 INNER JOIN app.Import AS I
			ON I.Id = D.Id 
			   AND I.PersonId = D.PersonId
			   AND I.ImportMetadataId = D.ImportMetadataId
			   AND I.ImportMetadataId = @id

	SET @changed += @@ROWCOUNT
	
	-- INSERT rest
	INSERT INTO app.Import(Id, ImportMetadataId, PersonId, SourcePersonId, SourceValue, SourceModifier, ValueString, ValueNumber, ValueDate)
	SELECT
		D.Id
	  , ImportMetadataId = @id
	  , D.PersonId
	  , D.SourcePersonId
	  , D.SourceValue
	  , D.SourceModifier
	  , D.ValueString
	  , D.ValueNumber
	  , D.ValueDate
	FROM @data AS D
	WHERE NOT EXISTS (SELECT 1 
					  FROM app.Import AS I 
					  WHERE I.Id = D.Id 
						    AND I.PersonId = D.PersonId
						    AND I.ImportMetadataId = D.ImportMetadataId
						    AND I.ImportMetadataId = @id)

	SELECT Changed = @changed + @@ROWCOUNT

END
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Gets all imported records for a given metadata.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportData]
	@id uniqueidentifier,
    @user auth.[User],
	@groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM app.ImportMetadata AS IT WHERE @id = IT.Id))
    BEGIN;
        THROW 70404, N'ImportMetadata does not exist.', 1;
    END;

	-- Confirm user allowed to add data for this metadata
	DECLARE @allowed app.ResourceIdTable;

	INSERT INTO @allowed (Id)
	EXEC app.sp_GetImportMetadata @user, @groups, @admin

	IF (NOT EXISTS (SELECT 1 FROM @allowed WHERE Id = @id))
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to access import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	DECLARE @changed INT = 0;

	SELECT
		I.Id
	  , I.ImportMetadataId
	  , I.PersonId
	  , I.SourcePersonId
	  , I.SourceValue
	  , I.ValueString
	  , I.ValueNumber
	  , I.ValueDate
	FROM app.Import AS I
	WHERE I.ImportMetadataId = @id

END
GO
