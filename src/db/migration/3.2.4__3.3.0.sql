
/*
 * Update version.
 */
IF EXISTS (SELECT 1 FROM ref.Version)
    UPDATE ref.Version
    SET [Version] = '3.3.0'
ELSE 
    INSERT INTO ref.[Version] (Lock, Version)
    SELECT 'X', '3.3.0'

/*
 * [adm].[sp_CreateDynamicDatasetQuery].
 */
IF OBJECT_ID('adm.sp_CreateDynamicDatasetQuery', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateDynamicDatasetQuery];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Create a dynamic datasetquery.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateDynamicDatasetQuery]
	@shape INT,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
	@isEnc bit,
	@schema nvarchar(max),
	@sqlDate nvarchar(1000) = NULL,
	@sqlValString nvarchar(1000) = NULL,
	@sqlValNum nvarchar(1000) = NULL,
    @tags app.DatasetQueryTagTable READONLY,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'DatasetQuery.Name is required.', 1;

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DatasetQuery.SqlStatement is required.', 1;

	IF (app.fn_NullOrWhitespace(@schema) = 1)
        THROW 70400, N'DatasetQuery.Schema is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        DECLARE @ins1 TABLE (
            [Id] uniqueidentifier,
			[Shape] int not null,
            [Name] nvarchar(200) not null,
            [CategoryId] int null,
            [Description] nvarchar(max) null,
            [SqlStatement] nvarchar(4000) not null,
			[Schema] nvarchar(max) null,
			[IsEncounterBased] bit null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
			[SqlFieldValueNumeric] nvarchar(1000) null,
            [Created] datetime not null,
            [CreatedBy] nvarchar(1000) not null,
            [Updated] datetime not null,
            [UpdatedBy] nvarchar(1000) not null
        );

		DECLARE @ins2 TABLE (
            [Id] uniqueidentifier,
			[Schema] nvarchar(max) null,
			[IsEncounterBased] bit null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
			[SqlFieldValueNumeric] nvarchar(1000) null
        );

		INSERT INTO app.DatasetQuery ([Shape], [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT
            inserted.Id,
			inserted.Shape,
            inserted.[Name],
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @ins1 ([Id], [Shape], [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        VALUES (@shape, @name, @catid, @desc, @sql, GETDATE(), @user, GETDATE(), @user);

		DECLARE @id UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM @ins1);

        INSERT INTO app.DynamicDatasetQuery ([Id], [Schema], IsEncounterBased, SqlFieldDate, SqlFieldValueString, SqlFieldValueNumeric)
		OUTPUT
            inserted.Id,
			inserted.[Schema],
			inserted.[IsEncounterBased],
			inserted.[SqlFieldDate],
			inserted.[SqlFieldValueString],
			inserted.[SqlFieldValueNumeric]
        INTO @ins2 ([Id], [Schema], [IsEncounterBased], [SqlFieldDate], [SqlFieldValueString], [SqlFieldValueNumeric])
        VALUES (@id, @schema, @isEnc, @sqlDate, @sqlValString, @sqlValNum);

		UPDATE @ins1
		SET [Schema] = i2.[Schema]
		  , [IsEncounterBased] = i2.[IsEncounterBased]
		  , [SqlFieldDate] = i2.[SqlFieldDate]
		  , [SqlFieldValueString] = i2.[SqlFieldValueString]
		  , [SqlFieldValueNumeric] = i2.[SqlFieldValueNumeric]
		FROM @ins2 AS i2
        
        SELECT
            [Id],
			[Shape],
            [Name],
            [CategoryId],
            [Description],
            [SqlStatement],
			[Schema],
			[IsEncounterBased],
			[SqlFieldDate],
			[SqlFieldValueString],
			[SqlFieldValueNumeric],
            [Created],
            [CreatedBy],
            [Updated],
            [UpdatedBy]
        FROM @ins1;

        INSERT INTO app.DatasetQueryTag (DatasetQueryId, Tag)
        OUTPUT inserted.DatasetQueryId, inserted.Tag
        SELECT @id, Tag
        FROM @tags;

        INSERT INTO auth.DatasetQueryConstraint (DatasetQueryId, ConstraintId, ConstraintValue)
        OUTPUT inserted.DatasetQueryId, inserted.ConstraintId, inserted.ConstraintValue
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

/*
 * [adm].[sp_CreateDatasetQuery].
 */
IF OBJECT_ID('adm.sp_CreateDatasetQuery', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateDatasetQuery];
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Create a dataset query.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateDatasetQuery]
    @uid app.UniversalId,
    @shape int,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
    @tags app.DatasetQueryTagTable READONLY,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@shape IS NULL)
        THROW 70400, N'DatasetQuery.Shape is required.', 1;
    
    IF NOT EXISTS (SELECT Id FROM ref.Shape WHERE Id = @shape)
        THROW 70404, N'DatasetQuery.Shape is not supported.', 1;
    
    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'DatasetQuery.Name is required.', 1;

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DatasetQuery.SqlStatement is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        IF EXISTS (SELECT 1 FROM app.DatasetQuery WHERE @uid = UniversalId)
            THROW 70409, N'DatasetQuery already exists with universal id.', 1;

        DECLARE @ins TABLE (
            Id uniqueidentifier,
            UniversalId nvarchar(200) null,
            Shape int not null,
            [Name] nvarchar(200) not null,
            CategoryId int null,
            [Description] nvarchar(max) null,
            SqlStatement nvarchar(4000) not null,
            Created datetime not null,
            CreatedBy nvarchar(1000) not null,
            Updated datetime not null,
            UpdatedBy nvarchar(1000) not null
        );

        INSERT INTO app.DatasetQuery (UniversalId, Shape, [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT
            inserted.Id,
            inserted.UniversalId,
            inserted.Shape,
            inserted.Name,
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @ins
        VALUES (@uid, @shape, @name, @catid, @desc, @sql, GETDATE(), @user, GETDATE(), @user);

        DECLARE @id UNIQUEIDENTIFIER;
        SELECT TOP 1 @id = Id from @ins;

        SELECT
            Id,
            UniversalId,
            Shape,
            [Name],
            CategoryId,
            [Description],
            SqlStatement,
			IsEncounterBased = CAST(1 AS BIT),
            Created,
            CreatedBy,
            Updated,
            UpdatedBy
        FROM @ins;

        INSERT INTO app.DatasetQueryTag (DatasetQueryId, Tag)
        OUTPUT inserted.DatasetQueryId, inserted.Tag
        SELECT @id, Tag
        FROM @tags;

        INSERT INTO auth.DatasetQueryConstraint (DatasetQueryId, ConstraintId, ConstraintValue)
        OUTPUT inserted.DatasetQueryId, inserted.ConstraintId, inserted.ConstraintValue
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

/*
 * [adm].[sp_GetDatasetQueryById].
 */
IF OBJECT_ID('adm.sp_GetDatasetQueryById', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetDatasetQueryById];
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Get an app.DatasetQuery by Id for admins.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetDatasetQueryById]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

	-- Get dataset
	SELECT
		dq.Id,
		dq.UniversalId,
		dq.Shape,
		dq.Name,
		dq.CategoryId,
		dq.[Description],
		dq.SqlStatement,
		IsEncounterBased = ISNULL(ddq.IsEncounterBased, 1),
		ddq.[Schema],
		ddq.SqlFieldDate,
		ddq.SqlFieldValueString,
		ddq.SqlFieldValueNumeric,
		dq.Created,
		dq.CreatedBy,
		dq.Updated,
		dq.UpdatedBy
	FROM app.DatasetQuery dq
		 LEFT JOIN app.DynamicDatasetQuery ddq
			ON dq.Id = ddq.Id
	WHERE dq.Id = @id

    -- Get tags
    SELECT
        DatasetQueryId,
        Tag
    FROM app.DatasetQueryTag
    WHERE DatasetQueryId = @id;

    -- Get constraints
    SELECT
        DatasetQueryId,
        ConstraintId,
        ConstraintValue
    FROM auth.DatasetQueryConstraint
    WHERE DatasetQueryId = @id;
END

/*
 * Drop previous unused login-related stored procedures.
 */
IF OBJECT_ID('auth.sp_CreateLogin') IS NOT NULL
    DROP PROCEDURE auth.sp_CreateLogin;
GO

IF OBJECT_ID('auth.sp_GetLoginByUsername') IS NOT NULL
    DROP PROCEDURE auth.sp_GetLoginByUsername;
GO

/*
 * Repurpose previous [auth].[Login] table.
 */
IF OBJECT_ID('auth.Login') IS NOT NULL
    DROP TABLE auth.Login;
GO
CREATE TABLE [auth].[Login]
(
    [Id] [uniqueidentifier] NOT NULL,
    ScopedIdentity nvarchar(500) NOT NULL,
    FullIdentity nvarchar(1000) NOT NULL,
    Claims nvarchar(max) NOT NULL,
    Created datetime NOT NULL,
    Updated datetime NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [auth].[Login] ADD CONSTRAINT [PK_Login_Id] PRIMARY KEY CLUSTERED
(
    Id ASC
) ON [PRIMARY]
GO
ALTER TABLE [auth].[Login]
ADD CONSTRAINT DF_Login_Id DEFAULT (newsequentialid()) FOR [Id]
GO
CREATE NONCLUSTERED INDEX IX_Login_ScopedIdentity ON [auth].[Login] ([ScopedIdentity] ASC);
GO

/*
 * Create auth.sp_UpsertLogin.
 */
IF OBJECT_ID('auth.sp_UpsertLogin', 'P') IS NOT NULL
    DROP PROCEDURE auth.sp_UpsertLogin;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/7/24
-- Description: Records a Login event from Leaf
-- =======================================
CREATE PROCEDURE auth.sp_UpsertLogin
    @scopedId nvarchar(500),
    @fullId nvarchar(1000),
    @claims nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @id UNIQUEIDENTIFIER;
    SELECT @id = Id FROM auth.Login WHERE ScopedIdentity = @scopedId;
    IF (@id IS NOT NULL)
    BEGIN;
        UPDATE auth.[Login]
        SET
            ScopedIdentity = @scopedId,
            FullIdentity = @fullId,
            Claims = @claims,
            Updated = GETDATE()
        WHERE Id = @id;
    END;
    ELSE
    BEGIN;
        INSERT INTO auth.[Login] (ScopedIdentity, FullIdentity, Claims, Created, Updated)
        SELECT @scopedId, @fullId, @claims, GETDATE(), GETDATE();
    END;
END
GO

/*
 * Create [adm].[sp_UpdateDynamicDatasetQuery].
 */
IF OBJECT_ID('adm.sp_UpdateDynamicDatasetQuery', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateDynamicDatasetQuery];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Update a dynamic datasetquery.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateDynamicDatasetQuery]
    @id UNIQUEIDENTIFIER,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
	@isEnc bit,
	@schema nvarchar(max),
	@sqlDate nvarchar(1000) = NULL,
	@sqlValString nvarchar(1000) = NULL,
	@sqlValNum nvarchar(1000) = NULL,
    @tags app.DatasetQueryTagTable READONLY,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'DatasetQuery.Id is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'DatasetQuery.Name is required.', 1;

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DatasetQuery.SqlStatement is required.', 1;

	IF (app.fn_NullOrWhitespace(@schema) = 1)
        THROW 70400, N'DatasetQuery.Schema is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        IF NOT EXISTS (SELECT Id FROM app.DatasetQuery WHERE Id = @id)
            THROW 70404, N'DatasetQuery not found.', 1;

		DECLARE @upd1 TABLE (
            Id uniqueidentifier,
            UniversalId nvarchar(200) null,
            Shape int not null,
            [Name] nvarchar(200) not null,
            CategoryId int null,
            [Description] nvarchar(max) null,
            SqlStatement nvarchar(4000) not null,
			IsEncounterBased bit null,
			[Schema] nvarchar(max) null,
			SqlFieldDate nvarchar(1000) null,
			SqlFieldValueString nvarchar(1000) null,
			SqlFieldValueNumeric nvarchar(1000) null,
            Created datetime not null,
            CreatedBy nvarchar(1000) not null,
            Updated datetime not null,
            UpdatedBy nvarchar(1000) not null
        );

		DECLARE @upd2 TABLE (
            Id uniqueidentifier,
			IsEncounterBased bit null,
			[Schema] nvarchar(max) null,
			SqlFieldDate nvarchar(1000) null,
			SqlFieldValueString nvarchar(1000) null,
			SqlFieldValueNumeric nvarchar(1000) null
        );

		UPDATE app.DatasetQuery
        SET
            [Shape] = -1,
            [Name] = @name,
            [CategoryId] = @catid,
            [Description] = @desc,
            [SqlStatement] = @sql,
            [Updated] = GETDATE(),
            [UpdatedBy] = @user
		OUTPUT
            inserted.Id,
            inserted.UniversalId,
            inserted.Shape,
            inserted.[Name],
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @upd1 (Id, UniversalId, Shape, [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        WHERE Id = @id;

		DELETE app.DynamicDatasetQuery
		WHERE Id = @id

        INSERT INTO app.DynamicDatasetQuery ([Id], [IsEncounterBased], [Schema], [SqlFieldDate], [SqlFieldValueString], [SqlFieldValueNumeric])
		OUTPUT
            inserted.Id,
            inserted.[IsEncounterBased],
			inserted.[Schema],
			inserted.[SqlFieldDate],
			inserted.[SqlFieldValueString],
			inserted.[SqlFieldValueNumeric]
        INTO @upd2 ([Id], [IsEncounterBased], [Schema], [SqlFieldDate], [SqlFieldValueString], [SqlFieldValueNumeric])
		VALUES (@id, @isEnc, @schema, @sqlDate, @sqlValString, @sqlValNum)

		UPDATE @upd1
		SET 
			[IsEncounterBased] = i2.[IsEncounterBased],
			[Schema] = i2.[Schema],
			[SqlFieldDate] = i2.[SqlFieldDate],
			[SqlFieldValueString] = i2.[SqlFieldValueString],
			[SqlFieldValueNumeric] = i2.[SqlFieldValueNumeric]
		FROM @upd2 AS i2

		SELECT * FROM @upd1

        DELETE FROM app.DatasetQueryTag
        WHERE DatasetQueryId = @id;

        INSERT INTO app.DatasetQueryTag (DatasetQueryId, Tag)
        OUTPUT inserted.DatasetQueryId, inserted.Tag
        SELECT @id, Tag
        FROM @tags;

        DELETE FROM auth.DatasetQueryConstraint
        WHERE DatasetQueryId = @id;

        INSERT INTO auth.DatasetQueryConstraint (DatasetQueryId, ConstraintId, ConstraintValue)
        OUTPUT inserted.DatasetQueryId, inserted.ConstraintId, inserted.ConstraintValue
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

/*
 * Update [adm].[sp_UpdateDatasetQuery].
 */
IF OBJECT_ID('adm.sp_UpdateDatasetQuery', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateDatasetQuery];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Update a datasetquery.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateDatasetQuery]
    @id UNIQUEIDENTIFIER,
    @uid app.UniversalId,
    @shape int,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
    @tags app.DatasetQueryTagTable READONLY,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'DatasetQuery.Id is required.', 1;

    IF (@shape IS NULL)
        THROW 70400, N'DatasetQuery.Shape is required.', 1;
    
    IF NOT EXISTS (SELECT Id FROM ref.Shape WHERE Id = @shape)
        THROW 70404, N'DatasetQuery.Shape is not supported.', 1;
    
    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'DatasetQuery.Name is required.', 1;

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DatasetQuery.SqlStatement is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        IF NOT EXISTS (SELECT Id FROM app.DatasetQuery WHERE Id = @id)
            THROW 70404, N'DatasetQuery not found.', 1;

        IF EXISTS (SELECT 1 FROM app.DatasetQuery WHERE Id != @id AND (@uid = UniversalId))
            THROW 70409, N'DatasetQuery already exists with universal id.', 1;

		DECLARE @ins TABLE (
            Id uniqueidentifier,
            UniversalId nvarchar(200) null,
            Shape int not null,
            [Name] nvarchar(200) not null,
            CategoryId int null,
            [Description] nvarchar(max) null,
            SqlStatement nvarchar(4000) not null,
            Created datetime not null,
            CreatedBy nvarchar(1000) not null,
            Updated datetime not null,
            UpdatedBy nvarchar(1000) not null
        );

        UPDATE app.DatasetQuery
        SET
            UniversalId = @uid,
            Shape = @shape,
            [Name] = @name,
            CategoryId = @catid,
            [Description] = @desc,
            SqlStatement = @sql,
            Updated = GETDATE(),
            UpdatedBy = @user
		OUTPUT
            inserted.Id,
            inserted.UniversalId,
            inserted.Shape,
            inserted.Name,
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
		INTO @ins
        WHERE Id = @id;

		DELETE app.DynamicDatasetQuery
		WHERE Id = @id

		SELECT * FROM @ins

        DELETE FROM app.DatasetQueryTag
        WHERE DatasetQueryId = @id;

        INSERT INTO app.DatasetQueryTag (DatasetQueryId, Tag)
        OUTPUT inserted.DatasetQueryId, inserted.Tag
        SELECT @id, Tag
        FROM @tags;

        DELETE FROM auth.DatasetQueryConstraint
        WHERE DatasetQueryId = @id;

        INSERT INTO auth.DatasetQueryConstraint (DatasetQueryId, ConstraintId, ConstraintValue)
        OUTPUT inserted.DatasetQueryId, inserted.ConstraintId, inserted.ConstraintValue
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

/*
 * Update [app].[sp_GetDatasetContextById].
 */
IF OBJECT_ID('app.sp_GetDatasetContextById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetDatasetContextById];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.Id and DatasetQuery.Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetContextById]
    @datasetid UNIQUEIDENTIFIER,
    @queryid UNIQUEIDENTIFIER,
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

    -- datasetconstraint ok?
    IF (auth.fn_UserIsAuthorizedForDatasetQueryById(@user, @groups, @datasetid, @admin) = 0)
    BEGIN;
        DECLARE @dataset403 nvarchar(400) = @user + N' is not authorized to execute dataset ' + app.fn_StringifyGuid(@datasetid);
        THROW 70403, @dataset403, 1;
    END;

    -- get pepper
    SELECT
        QueryId = Id,
        Pepper
    FROM
        app.Query
    WHERE Id = @queryid;

	-- dynamic
	IF EXISTS (SELECT 1 FROM app.DynamicDatasetQuery ddq WHERE ddq.Id = @datasetid)
		BEGIN
			SELECT
				ddq.Id,
				dq.[Name],
				dq.SqlStatement,
				ddq.IsEncounterBased,
				ddq.[Schema],
				ddq.SqlFieldDate,
				ddq.SqlFieldValueString,
				ddq.SqlFieldValueNumeric,
				dq.Shape
			FROM
				app.DynamicDatasetQuery ddq
			JOIN app.DatasetQuery dq ON ddq.Id = dq.Id
			LEFT JOIN
				app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id
			WHERE
				ddq.Id = @datasetid;
		END

	-- else shaped
	ELSE
		BEGIN
			SELECT
				dq.Id,
				dq.UniversalId,
				dq.Shape,
				dq.Name,
				dq.SqlStatement
			FROM
				app.DatasetQuery dq
			LEFT JOIN
				app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id
			WHERE
				dq.Id = @datasetid;
		END

END
GO

/*
 * Update [app].[sp_GetDatasetContextById].
 */
IF OBJECT_ID('app.sp_GetDatasetQueries', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetDatasetQueries];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/21
-- Description: Retrieves all DatasetQuery records to which the user is authorized.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetQueries]
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
        SELECT dq.Id
        FROM app.DatasetQuery dq
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
        INSERT INTO @ids (Id)
        SELECT
            dq.Id
        FROM app.DatasetQuery dq
        WHERE EXISTS (
            SELECT 1
            FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = dq.Id AND
            ConstraintId = 1 AND
            ConstraintValue = @user
        )
        OR EXISTS (
            SELECT 1
            FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = dq.Id AND
            ConstraintId = 2 AND
            ConstraintValue in (SELECT [Group] FROM @groups)
        )
        OR NOT EXISTS (
            SELECT 1
            FROM auth.DatasetQueryConstraint
            WHERE DatasetQueryId = dq.Id
        );
    END;

    -- produce the hydrated records
    SELECT
        i.Id,
        dq.UniversalId,
        dq.Shape,
        dq.[Name],
        dqc.Category,
        dq.[Description],
        dq.SqlStatement,
		IsEncounterBased = ISNULL(ddq.IsEncounterBased, 1),
		ddq.[Schema],
		ddq.SqlFieldDate,
		ddq.SqlFieldValueString,
		ddq.SqlFieldValueNumeric
    FROM @ids i
    JOIN app.DatasetQuery dq ON i.Id = dq.Id
	LEFT JOIN app.DynamicDatasetQuery ddq ON dq.Id = ddq.Id
    LEFT JOIN app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id

    -- produce the tags for each record
    SELECT
        i.Id,
        Tag
    FROM @ids i
    JOIN app.DatasetQueryTag t on i.Id = t.DatasetQueryId

END
GO

/*
 * Update [adm].[sp_DeleteDatasetQuery].
 */
IF OBJECT_ID('adm.sp_DeleteDatasetQuery', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_DeleteDatasetQuery];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Delete an app.DatasetQuery.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteDatasetQuery]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;
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
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END