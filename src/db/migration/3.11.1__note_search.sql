

/**
 * Add Note Search related columns to app.DynamicDatasetQuery
 */
IF COLUMNPROPERTY(OBJECT_ID('app.DynamicDatasetQuery'), 'IsNote', 'ColumnId') IS NULL
BEGIN
    ALTER TABLE app.DynamicDatasetQuery 
    ADD [IsNote] BIT NULL
END

IF COLUMNPROPERTY(OBJECT_ID('app.DynamicDatasetQuery'), 'SqlFieldDeidValueString', 'ColumnId') IS NULL
BEGIN
    ALTER TABLE app.DynamicDatasetQuery 
    ADD [SqlFieldDeidValueString] nvarchar(1000) NULL
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
        IsNote           = ISNULL(ddq.IsNote, 0),
        ddq.[Schema],
        ddq.SqlFieldDate,
        ddq.SqlFieldValueString,
        ddq.SqlFieldDeidValueString,
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


/* Begin changes for app.ResourceUniversalIdTable */

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/10
-- Description: Retrieves Concepts requested by UniversalIds, filtered by constraint.
-- =======================================
ALTER PROCEDURE [app].[sp_GetConceptsByUIds]
    @uids app.ResourceUniversalIdTable READONLY,
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
    JOIN @uids u on c.UniversalId = u.UniversalId;
    
    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @ids, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END


GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves preflight report and concepts requested by universalIds.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightConceptByUId]
    @uid nvarchar(200),
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceUniversalIdTable;

    INSERT INTO @requested
    SELECT @uid;

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_UniversalConceptPreflightCheck @requested, @user, @groups, @admin = @admin;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id
    FROM @preflight
    WHERE IsPresent = 1 and IsAuthorized = 1;

    SELECT Id, UniversalId, IsPresent, IsAuthorized
    FROM @preflight;

    exec app.sp_HydrateConceptsByIds @allowed;

END

GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves preflight report and concepts by UIds.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightConceptsByUIds]
    @uids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_UniversalConceptPreflightCheck @uids, @user, @groups, @admin = @admin;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id
    FROM @preflight
    WHERE IsPresent = 1 and IsAuthorized = 1;

    SELECT Id, UniversalId, IsPresent, IsAuthorized
    FROM @preflight;

    EXEC app.sp_HydrateConceptsByIds @allowed;

END

GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/10/21
-- Description: Retrieves preflight import Ids by UId.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightImportsByUIds]
    @uids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	-- Imports cannot be accessed by UID, return nothing.
	SELECT 
		Id = CAST(NULL AS uniqueidentifier)
	  , IsPresent = CAST(0 AS BIT)
	  , IsAuthorized = CAST(0 AS BIT)

END

GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a query preflight check by Ids.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightQueriesByUIds]
    @quids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    declare @preflight table (
        QueryId UNIQUEIDENTIFIER,
        QueryUniversalId app.UniversalId,
        QueryVer int,
        QueryIsPresent bit null,
        QueryIsAuthorized bit null,
        ConceptId UNIQUEIDENTIFIER,
        ConceptUniversalId app.UniversalId null,
        ConceptIsPresent bit null,
        ConceptIsAuthorized bit null
    );


    with initial (QueryId, UniversalId, Ver, IsPresent) as (
        select aq.Id, qs.UniversalId, Ver, IsPresent = case when aq.Id is not null then cast(1 as bit) else cast(0 as bit) end
        from @quids qs
        left join app.Query aq on qs.UniversalId = aq.UniversalId
    ),
    queries (QueryId, IsPresent) as (
        select qs.QueryId, IsPresent
        from initial qs
        left join app.Query aq on qs.QueryId = aq.Id
        union all
        select qd.DependsOn, cast(1 as bit)
        from queries q
        join rela.QueryDependency qd on qd.QueryId = q.QueryId
    ),
    enriched (QueryId, UniversalId, Ver, IsPresent) as (
        select
            qs.QueryId,
            q.UniversalId,
            q.Ver,
            qs.IsPresent
        from queries qs
        left join app.Query q on qs.QueryId = q.Id
    ),
    authQ (QueryId, UniversalId, Ver, IsPresent, IsAuthorized) as (
        select e.QueryId, e.UniversalId, e.Ver, e.IsPresent, auth.fn_UserIsAuthorizedForQueryById(@user, @groups, e.QueryId, @admin)
        from enriched e
    ),
    withConcepts (QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId) as (
        select a.*, ConceptId = qc.DependsOn
        from authQ a
        left join rela.QueryConceptDependency qc on a.QueryId = qc.QueryId
    )
    insert into @preflight (QueryId, QueryUniversalId, QueryVer, QueryIsPresent, QueryIsAuthorized, ConceptId)
    select QueryId, UniversalId, Ver, IsPresent, NULL, NULL
    from initial
    where QueryId is null
    union
    select QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId
    from withConcepts;

    declare @concIds app.ResourceIdTable;
    insert into @concIds
    select distinct ConceptId
    from @preflight;

    declare @conceptAuths app.ConceptPreflightTable;
    insert @conceptAuths
    exec app.sp_InternalConceptPreflightCheck @concIds, @user, @groups, @admin = @admin;

    update p
    set
        p.ConceptUniversalId = ca.UniversalId,
        p.ConceptIsPresent = ca.IsPresent,
        p.ConceptIsAuthorized = ca.IsAuthorized
    from @preflight p
    join @conceptAuths ca on p.ConceptId = ca.Id;

    select *
    from @preflight
    order by QueryId desc;
END

GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a preflight resources check by UIds
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightResourcesByUIds]
    @quids app.ResourceUniversalIdTable READONLY,
    @cuids app.ResourceUniversalIdTable READONLY,
	@iuids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @sessionType auth.SessionType,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    exec app.sp_GetPreflightQueriesByUIds @quids, @user, @groups, @admin = @admin;

    exec app.sp_GetPreflightConceptsByUIds @cuids, @user, @groups, @admin = @admin;

	exec app.sp_GetPreflightImportsByUIds @iuids, @user, @groups, @admin = @admin;

    exec app.sp_GetPreflightGlobalPanelFilters @sessionType;
END

GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Preflight checks universally referenced conceptIds.
-- Required Checks: Is concept present? Is the user authorized to execute?
-- =======================================
ALTER PROCEDURE [app].[sp_UniversalConceptPreflightCheck]
    @uids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @results app.ConceptPreflightTable;

    INSERT INTO @results (UniversalId, IsPresent, IsAuthorized)
    SELECT UniversalId, 0, 0 -- initialize bools to false
    FROM @uids;

    -- identify which ids are present
    WITH present as (
        SELECT Id, UniversalId
        FROM app.Concept c
        WHERE EXISTS (SELECT 1 FROM @uids u WHERE u.UniversalId = c.UniversalId)
    )
    UPDATE @results
    SET
        Id = p.Id,
        IsPresent = 1
    FROM @results r
    JOIN present p on r.UniversalId = p.UniversalId;

    -- identify which ids are authorized
    -- dont bother checking missing concepts
    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT Id
    FROM @results
    WHERE IsPresent = 1;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id FROM app.fn_FilterConceptsByConstraint(@user, @groups, @requested, @admin);

    UPDATE @results
    SET
        IsAuthorized = 1
    FROM @results r
    WHERE EXISTS (SELECT 1 FROM @allowed a WHERE r.Id = a.Id);

    SELECT
        Id,
        UniversalId,
        IsPresent,
        IsAuthorized
    FROM @results;

END

GO


-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Create a dynamic datasetquery.
-- =======================================
ALTER PROCEDURE [adm].[sp_CreateDynamicDatasetQuery]
	@shape INT,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
	@isEnc bit,
    @isNote bit,
	@schema nvarchar(max),
	@sqlDate nvarchar(1000) = NULL,
	@sqlValString nvarchar(1000) = NULL,
    @sqlValDeidString nvarchar(1000) = NULL,
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
            [IsNote] bit null,
            [IsDefault] bit null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
            [SqlFieldDeidValueString] nvarchar(1000) null,
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
            [IsNote] bit null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
            [SqlFieldDeidValueString] nvarchar(1000) null,
			[SqlFieldValueNumeric] nvarchar(1000) null
        );

		INSERT INTO app.DatasetQuery ([Shape], [Name], IsDefault, CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT
            inserted.Id,
			inserted.Shape,
            inserted.[Name],
            inserted.IsDefault,
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @ins1 ([Id], [Shape], [Name], [IsDefault], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        VALUES (@shape, @name, 0, @catid, @desc, @sql, GETDATE(), @user, GETDATE(), @user);

		DECLARE @id UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM @ins1);

        INSERT INTO app.DynamicDatasetQuery ([Id], [Schema], IsEncounterBased, IsNote, SqlFieldDate, SqlFieldValueString, SqlFieldDeidValueString, SqlFieldValueNumeric)
		OUTPUT
            inserted.Id,
			inserted.[Schema],
			inserted.[IsEncounterBased],
            inserted.[IsNote],
			inserted.[SqlFieldDate],
			inserted.[SqlFieldValueString],
            inserted.[SqlFieldDeidValueString],
			inserted.[SqlFieldValueNumeric]
        INTO @ins2 ([Id], [Schema], [IsEncounterBased], [IsNote], [SqlFieldDate], [SqlFieldValueString], [SqlFieldDeidValueString], [SqlFieldValueNumeric])
        VALUES (@id, @schema, @isEnc, @isNote, @sqlDate, @sqlValString, @sqlValDeidString, @sqlValNum);

		UPDATE @ins1
		SET [Schema] = i2.[Schema]
		  , [IsEncounterBased] = i2.[IsEncounterBased]
          , [IsNote] = i2.IsNote
  		  , [SqlFieldDate] = i2.[SqlFieldDate]
		  , [SqlFieldValueString] = i2.[SqlFieldValueString]
          , [SqlFieldDeidValueString] = i2.[SqlFieldDeidValueString]
 		  , [SqlFieldValueNumeric] = i2.[SqlFieldValueNumeric]
		FROM @ins2 AS i2
        
        SELECT
            [Id],
			[Shape],
            [Name],
            [IsDefault],
            [CategoryId],
            [Description],
            [SqlStatement],
			[Schema],
			[IsEncounterBased],
            [IsNote],
			[SqlFieldDate],
			[SqlFieldValueString],
            [SqlFieldDeidValueString],
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

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Update a dynamic datasetquery.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateDynamicDatasetQuery]
    @id UNIQUEIDENTIFIER,
    --@isdefault bit,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
	@isEnc bit,
    @isNote bit,
	@schema nvarchar(max),
	@sqlDate nvarchar(1000) = NULL,
	@sqlValString nvarchar(1000) = NULL,
    @sqlValDeidString nvarchar(1000) = NULL,
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
            IsNote bit null,
			[Schema] nvarchar(max) null,
			SqlFieldDate nvarchar(1000) null,
			SqlFieldValueString nvarchar(1000) null,
            SqlFieldDeidValueString nvarchar(1000) null,
			SqlFieldValueNumeric nvarchar(1000) null,
            Created datetime not null,
            CreatedBy nvarchar(1000) not null,
            Updated datetime not null,
            UpdatedBy nvarchar(1000) not null
        );

		DECLARE @upd2 TABLE (
            Id uniqueidentifier,
			IsEncounterBased bit null,
            IsNote bit null,
			[Schema] nvarchar(max) null,
			SqlFieldDate nvarchar(1000) null,
			SqlFieldValueString nvarchar(1000) null,
            SqlFieldDeidValueString nvarchar(1000) null,
			SqlFieldValueNumeric nvarchar(1000) null
        );

		UPDATE app.DatasetQuery
        SET
            [Shape] = -1,
            [IsDefault] = 0,
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

        INSERT INTO app.DynamicDatasetQuery ([Id], [IsEncounterBased], [IsNote], [Schema], [SqlFieldDate], [SqlFieldValueString], [SqlFieldDeidValueString], [SqlFieldValueNumeric])
		OUTPUT
            inserted.Id,
            inserted.[IsEncounterBased],
            inserted.[IsNote],
			inserted.[Schema],
			inserted.[SqlFieldDate],
			inserted.[SqlFieldValueString],
            inserted.[SqlFieldDeidValueString],
			inserted.[SqlFieldValueNumeric]
        INTO @upd2 ([Id], [IsEncounterBased], [IsNote], [Schema], [SqlFieldDate], [SqlFieldValueString], [SqlFieldDeidValueString], [SqlFieldValueNumeric])
		VALUES (@id, @isEnc, @isNote, @schema, @sqlDate, @sqlValString, @sqlValDeidString, @sqlValNum)

		UPDATE @upd1
		SET 
			[IsEncounterBased] = i2.[IsEncounterBased],
            [IsNote] = i2.[IsNote],
 			[Schema] = i2.[Schema],
			[SqlFieldDate] = i2.[SqlFieldDate],
			[SqlFieldValueString] = i2.[SqlFieldValueString],
            [SqlFieldDeidValueString] = i2.[SqlFieldDeidValueString],
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
-- Create date: 2018/12/5
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.Id and DatasetQuery.Id.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetContextById]
    @datasetid UNIQUEIDENTIFIER,
    @queryid UNIQUEIDENTIFIER,
	@joinpanel BIT,
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
        Pepper,
		[Definition] = CASE WHEN @joinpanel = 0 THEN NULL ELSE [Definition] END
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
                ddq.IsNote,
				ddq.[Schema],
				ddq.SqlFieldDate,
				ddq.SqlFieldValueString,
                ddq.SqlFieldDeidValueString,
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
