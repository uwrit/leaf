/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.11.2'
GO

/**
 * Add [ColumnNamesJson] to app.DemographicQuery
 */
IF COLUMNPROPERTY(OBJECT_ID('app.DemographicQuery'), 'ColumnNamesJson', 'ColumnId') IS NULL
BEGIN
    ALTER TABLE app.DemographicQuery 
    ADD [ColumnNamesJson] NVARCHAR(MAX) NULL

    UPDATE app.DemographicQuery
    SET [ColumnNamesJson] = '{}'
END  
GO

/**
 * Add [IsDefault] to app.DatasetQuery
 */
IF COLUMNPROPERTY(OBJECT_ID('app.DatasetQuery'), 'IsDefault', 'ColumnId') IS NULL
BEGIN
    ALTER TABLE app.DatasetQuery 
    ADD [IsDefault] BIT NULL

    UPDATE app.DatasetQuery
    SET [IsDefault] = 0
END  
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/17
-- Description: Retrieves the app.Query.Pepper and app.DemographicQuery by Query.Id
-- =======================================
ALTER PROCEDURE [app].[sp_GetDemographicContextById]
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

    -- get pepper
    SELECT
        QueryId = Id,
        Pepper
    FROM app.Query
    WHERE Id = @queryid;

    -- get demographicquery
    SELECT
        SqlStatement,
        ColumnNamesJson
    FROM app.DemographicQuery
END
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/12
-- Description: Fetch the app.DemographicQuery record for an admin.
-- =======================================
ALTER PROCEDURE [adm].[sp_GetDemographicQuery]
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        SqlStatement,
        ColumnNamesJson,
        LastChanged,
        ChangedBy
    FROM app.DemographicQuery;
END
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/12
-- Description: Update the app.DemographicQuery record for an admin.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateDemographicQuery]
    @sql nvarchar(4000),
    @columns nvarchar(4000) = NULL,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DemographicQuery.SqlStatement is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        
        IF EXISTS (SELECT Lock FROM app.DemographicQuery)
        BEGIN;
            UPDATE app.DemographicQuery
            SET
                SqlStatement = @sql,
                ColumnNamesJson = @columns,
                LastChanged = GETDATE(),
                ChangedBy = @user
            OUTPUT
                inserted.SqlStatement,
                inserted.ColumnNamesJson,
                inserted.LastChanged,
                inserted.ChangedBy;
        END;
        ELSE
        BEGIN;
            INSERT INTO app.DemographicQuery (SqlStatement, ColumnNamesJson, LastChanged, ChangedBy, Shape)
            OUTPUT inserted.SqlStatement, inserted.ColumnNamesJson, inserted.LastChanged, inserted.ChangedBy, inserted.Shape
            VALUES (@sql, @columns, GETDATE(), @user, 3);
        END;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END

GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Update a datasetquery.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateDatasetQuery]
    @id UNIQUEIDENTIFIER,
    @uid app.UniversalId,
    @isdefault bit,
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
            IsDefault bit not null,
            Shape int not null,
            [Name] nvarchar(200) not null,
            CategoryId int null,
            [Description] nvarchar(max) null,
            SqlStatement nvarchar(4000) not null,
            Created datetime not null,
            CreatedBy nvarchar(1000) not null,
            Updated datetime not null,
            UpdatedBy nvarchar(1000) not null,
			[IsEncounterBased] bit null
        );

        UPDATE app.DatasetQuery
        SET
            UniversalId = @uid,
            IsDefault = @isdefault,
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
            inserted.IsDefault,
            inserted.Shape,
            inserted.Name,
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy,
			CAST(1 AS BIT)
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

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Update a dynamic datasetquery.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateDynamicDatasetQuery]
    @id UNIQUEIDENTIFIER,
    @isdefault bit,
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
            IsDefault bit not null,
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
            [IsDefault] = @isdefault,
            [Name] = @name,
            [CategoryId] = @catid,
            [Description] = @desc,
            [SqlStatement] = @sql,
            [Updated] = GETDATE(),
            [UpdatedBy] = @user
		OUTPUT
            inserted.Id,
            inserted.UniversalId,
            inserted.IsDefault,
            inserted.Shape,
            inserted.[Name],
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @upd1 (Id, UniversalId, IsDefault, Shape, [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
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

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/21
-- Description: Retrieves all DatasetQuery records to which the user is authorized.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetQueries]
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
        dq.IsDefault,
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