

IF (OBJECT_ID('auth.FK_DatasetQueryConstraint_DatasetQueryId', 'F') IS NOT NULL)
	BEGIN
		ALTER TABLE [auth].[DatasetQueryConstraint] DROP CONSTRAINT [FK_DatasetQueryConstraint_DatasetQueryId]
	END

IF (OBJECT_ID('app.FK_DatasetQueryTag_DatasetQueryId', 'F') IS NOT NULL)
	BEGIN
		ALTER TABLE [app].[DatasetQueryTag] DROP CONSTRAINT [FK_DatasetQueryTag_DatasetQueryId]
	END

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
        FROM (SELECT dq.Id FROM app.DatasetQuery dq
			  UNION ALL
			  SELECT ddq.Id FROM app.DynamicDatasetQuery ddq) dq
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
        INSERT INTO @ids (Id)
        SELECT
            dq.Id
        FROM (SELECT dq.Id FROM app.DatasetQuery dq
			  UNION ALL
			  SELECT ddq.Id FROM app.DynamicDatasetQuery ddq) dq
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
        dq.Name,
        dqc.Category,
        dq.[Description],
        dq.SqlStatement,
		IsEncounterBased = CONVERT(BIT,1)
    FROM @ids i
    JOIN app.DatasetQuery dq ON i.Id = dq.Id
    LEFT JOIN app.DatasetQueryCategory dqc ON dq.CategoryId = dqc.Id

	UNION ALL

	SELECT
        i.Id,
        UniversalId = NULL,
        Shape = -1,
        dq.Name,
        dqc.Category,
        dq.[Description],
        dq.SqlStatement,
		dq.IsEncounterBased
    FROM @ids i
    JOIN app.DynamicDatasetQuery dq on i.Id = dq.Id
    LEFT JOIN app.DatasetQueryCategory dqc on dq.CategoryId = dqc.Id;

    -- produce the tags for each record
    SELECT
        i.Id,
        Tag
    FROM @ids i
    JOIN app.DatasetQueryTag t on i.Id = t.DatasetQueryId

END
GO

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
				ddq.[Name],
				ddq.SqlStatement,
				ddq.IsEncounterBased,
				ddq.[Schema],
				ddq.SqlFieldDate,
				ddq.SqlFieldValueString,
				ddq.SqlFieldValueNumeric,
				Shape = -1
			FROM
				app.DynamicDatasetQuery ddq
			LEFT JOIN
				app.DatasetQueryCategory dqc on ddq.CategoryId = dqc.Id
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
				app.DatasetQueryCategory dqc on dq.CategoryId = dqc.Id
			WHERE
				dq.Id = @datasetid;
		END

END
GO

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

	-- dynamic
    IF EXISTS (SELECT 1 FROM app.DynamicDatasetQuery ddq WHERE ddq.Id = @id)
		BEGIN
			SELECT
				dq.Id,
				Shape = -1,
				dq.Name,
				dq.CategoryId,
				dq.[Description],
				dq.SqlStatement,
				dq.IsEncounterBased,
				dq.SqlFieldDate,
				dq.SqlFieldValueString,
				dq.SqlFieldValueNumeric,
				dq.Created,
				dq.CreatedBy,
				dq.Updated,
				dq.UpdatedBy
			FROM app.DynamicDatasetQuery dq
			WHERE dq.Id = @id
		END

	-- else shaped
	ELSE
		BEGIN
			SELECT
				dq.Id,
				dq.UniversalId,
				dq.Shape,
				dq.Name,
				dq.CategoryId,
				dq.[Description],
				dq.SqlStatement,
				IsEncounterBased = 1,
				dq.Created,
				dq.CreatedBy,
				dq.Updated,
				dq.UpdatedBy
			FROM app.DatasetQuery dq
			WHERE dq.Id = @id
		END

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
GO

IF OBJECT_ID('adm.sp_CreateDynamicDatasetQuery', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateDynamicDatasetQuery];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Create a dynamic datasetquery.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateDynamicDatasetQuery]
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

        DECLARE @ins TABLE (
            [Id] uniqueidentifier,
            [Name] nvarchar(200) not null,
            [CategoryId] int null,
            [Description] nvarchar(max) null,
            [SqlStatement] nvarchar(4000) not null,
			[Schema] nvarchar(max) not null,
			[IsEncounterBased] bit not null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
			[SqlFieldValueNumeric] nvarchar(1000) null,
            [Created] datetime not null,
            [CreatedBy] nvarchar(1000) not null,
            [Updated] datetime not null,
            [UpdatedBy] nvarchar(1000) not null
        );

        INSERT INTO app.DynamicDatasetQuery (
			[Name], CategoryId, [Description], SqlStatement, [Schema], IsEncounterBased, 
			SqlFieldDate, SqlFieldValueString, SqlFieldValueNumeric, Created, CreatedBy, Updated, UpdatedBy
		)
        OUTPUT
            inserted.Id,
            inserted.Name,
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
			inserted.[Schema],
			inserted.IsEncounterBased,
			inserted.SqlFieldDate,
			inserted.SqlFieldValueString,
			inserted.SqlFieldValueNumeric,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @ins
        VALUES (@name, @catid, @desc, @sql, @schema, @isEnc, @sqlDate, @sqlValString, @sqlValNum, GETDATE(), @user, GETDATE(), @user);

        DECLARE @id UNIQUEIDENTIFIER;
        SELECT TOP 1 @id = Id from @ins;

        SELECT
            [Id],
            [Name],
            [CategoryId],
            [Description],
            [SqlStatement],
			[IsEncounterBased],
			[SqlFieldDate],
			[SqlFieldValueString],
			[SqlFieldValueNumeric],
            [Created],
            [CreatedBy],
            [Updated],
            [UpdatedBy]
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

        IF NOT EXISTS (SELECT Id FROM app.DynamicDatasetQuery WHERE Id = @id)
            THROW 70404, N'DatasetQuery not found.', 1;

        UPDATE app.DynamicDatasetQuery
        SET
            [Name] = @name,
            [CategoryId] = @catid,
            [Description] = @desc,
			[IsEncounterBased] = @isEnc,
            [SqlStatement] = @sql,
			[Schema] = @schema,
			[SqlFieldDate] = @sqlDate,
			[SqlFieldValuestring] = @sqlValString,
			[SqlFieldValueNumeric] = @sqlValNum,
            [Updated] = GETDATE(),
            [UpdatedBy] = @user
        OUTPUT
            inserted.Id,
            inserted.[Name],
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
			inserted.IsEncounterBased,
			inserted.[Schema],
			inserted.SqlFieldDate,
			inserted.SqlFieldValueString,
			inserted.SqlFieldValueNumeric,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        WHERE Id = @id;

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

		-- dynamic
		IF EXISTS (SELECT 1 FROM app.DynamicDatasetQuery ddq WHERE ddq.Id = @id)
			BEGIN
				DELETE FROM app.DynamicDatasetQuery
				OUTPUT deleted.Id
				WHERE Id = @id;
			END

		-- shaped
		ELSE 
			BEGIN
				DELETE FROM app.DatasetQuery
				OUTPUT deleted.Id
				WHERE Id = @id;
			END

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END


IF EXISTS (SELECT 1 FROM ref.Version)
    UPDATE ref.Version
    SET [Version] = '3.3.0'
ELSE 
    INSERT INTO ref.[Version] (Lock, Version)
    SELECT 'X', '3.3.0'