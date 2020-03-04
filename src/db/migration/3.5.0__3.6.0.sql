/*
 * Update version.
 */
UPDATE ref.[Version]
SET [Version] = '3.6.0'

/*
 * [adm].[sp_GetUsersBySearchTerm]
 */
IF OBJECT_ID('adm.sp_GetUsersBySearchTerm', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetUsersBySearchTerm];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/11/15
-- Description: Retrieves all users who matching a given search string.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetUsersBySearchTerm]
    @term NVARCHAR(50),
	@limit INT = 10
AS
BEGIN
    SET NOCOUNT ON

    SELECT TOP (@limit)
		L.Id
	  , L.ScopedIdentity
	  , L.FullIdentity
	  , SavedQueryCount = (SELECT COUNT(*) FROM [app].[Query] AS Q WHERE L.FullIdentity = Q.[Owner] AND Q.UniversalId IS NOT NULL AND Q.Nonce IS NULL)
	  , L.Created
	  , L.Updated
	FROM auth.[Login] AS L
	WHERE L.ScopedIdentity LIKE @term + '%'

END
GO

/*
 * [app].[sp_QuerySaveUpsert]
 */
IF OBJECT_ID('app.sp_QuerySaveUpsert', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_QuerySaveUpsert];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/1/9
-- Description: Performs a query upsert save.
-- =======================================
CREATE PROCEDURE [app].[sp_QuerySaveUpsert]
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @ver int,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User],
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- ensure saving user is the owner of the query
    DECLARE @owner NVARCHAR(1000), @qid UNIQUEIDENTIFIER;

    SELECT @qid = Id, @owner = [Owner]
    FROM app.Query
    WHERE Id = @queryid;

    IF (@qid IS NULL)
    BEGIN;
        SELECT UniversalId = NULL, Ver = NULL WHERE 1 = 0;
        RETURN;
    END;
    
    IF (@owner != @user AND @admin = 0)
    BEGIN;
        DECLARE @new403msg NVARCHAR(400) = N'Query ' + cast(@queryid as nvarchar(50)) + N' is not owned by ' + @user;
        THROW 70403, @new403msg, 1;
    END;

    -- determine if urn exists already
    DECLARE @oldowner NVARCHAR(1000), @oldqid UNIQUEIDENTIFIER, @oldver int;

    BEGIN TRAN;
    BEGIN TRY

        SELECT @oldqid = Id, @oldowner = [Owner], @oldver = Ver
        FROM app.Query
        WHERE UniversalId = @urn;

        IF (@oldqid IS NULL) -- if no this is an initial save for the node
        BEGIN;
            -- delegate to querysaveinitial
            EXEC app.sp_InternalQuerySaveInitial @queryid, @urn, 1, @name, @category, @conceptids, @queryids, @definition, @user;
        END;
        ELSE -- if yes this is a resave, ensure the old query is also owned by the user
        BEGIN;
            IF (@oldowner != @user AND @admin = 0)
            BEGIN;
                DECLARE @old403msg NVARCHAR(400) = N'Query ' + cast(@oldqid as nvarchar(50)) + N' is not owned by ' + @user;
                THROW 70403, @old403msg, 1;
            END;

            -- home node resave
            IF @ver IS NULL AND @oldver IS NOT NULL
                SET @ver = @oldver + 1;
                
            IF (@oldqid = @queryid)
            BEGIN;
                -- check for shallow save, @oldid = @queryid, app.Query update only, bump ver, incr updated.
                UPDATE app.Query
                SET
                    [Name] = @name,
                    Category = @category,
                    Updated = GETDATE(),
                    Ver = @ver
                WHERE Id = @queryid;
            END;
            ELSE
            BEGIN;
				
				-- If admin is making a change, allow it but make sure the original query owner remains so.
				IF (@admin = 0)
					-- delegate to resave sproc
					EXEC app.sp_InternalQuerySaveUpdateMove @oldqid, @queryid, @urn, @ver, @name, @category, @conceptids, @queryids, @definition, @user;
				ELSE
					BEGIN;
						-- save changes on user's behalf
						EXEC app.sp_InternalQuerySaveUpdateMove @oldqid, @queryid, @urn, @ver, @name, @category, @conceptids, @queryids, @definition, @oldowner;

						-- remove explicit admin privileges to query
						DELETE auth.QueryConstraint
						WHERE QueryId = @queryid
							  AND ConstraintValue = @user
					END;
            END;
        END;
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
    
    SELECT UniversalId, Ver
    FROM app.Query
    WHERE Id = @queryid;
END
GO

/*
 * [app].[sp_GetSavedQueryByUId]
 */
IF OBJECT_ID('app.sp_GetSavedQueryByUId', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetSavedQueryByUId];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieve a query by UniversalId if owner.
-- =======================================
CREATE PROCEDURE [app].[sp_GetSavedQueryByUId]
    @uid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- translate to local id
    DECLARE @id uniqueidentifier;
    SELECT @id = Id
    FROM app.Query
    WHERE UniversalId = @uid;

    DECLARE @result TABLE (
        Id UNIQUEIDENTIFIER NOT NULL,
        UniversalId nvarchar(200) NOT NULL,
        [Name] nvarchar(400) NULL,
        [Category] nvarchar(400) NULL,
        [Owner] nvarchar(1000) NOT NULL,
        Created datetime NOT NULL,
        [Definition] app.QueryDefinitionJson,
        Updated datetime not null,
        [Count] int null
    );

    -- if not found
    IF @id IS NULL
    BEGIN
        SELECT
            Id,
            UniversalId,
            [Name],
            [Category],
            [Owner],
            Created,
            Updated,
            [Definition],
            [Count]
        FROM @result;
        RETURN;
    END;

	-- Admin can access any query
	IF (@admin = 1)
		INSERT INTO @result (Id, UniversalId, [Name], [Category], [Owner], Created, Updated, [Definition])
		SELECT
			q.Id,
			q.UniversalId,
			q.[Name],
			q.[Category],
			q.[Owner],
			q.Created,
			q.Updated,
			d.[Definition]
		FROM app.Query q
		JOIN app.QueryDefinition d on q.Id = d.QueryId
		WHERE q.UniversalId = @uid;
	ELSE
		BEGIN
			-- permission filter
			WITH permitted AS (
				-- user based constraint
				SELECT
					QueryId
				FROM auth.QueryConstraint
				WHERE QueryId = @id
				AND ConstraintId = 1
				AND ConstraintValue = @user
				UNION
				-- group base constraint
				SELECT
					QueryId
				FROM auth.QueryConstraint
				WHERE QueryId = @id
				AND ConstraintId = 2
				AND ConstraintValue IN (SELECT [Group] FROM @groups)
			)
			INSERT INTO @result (Id, UniversalId, [Name], [Category], [Owner], Created, Updated, [Definition])
			SELECT
				q.Id,
				q.UniversalId,
				q.[Name],
				q.[Category],
				q.[Owner],
				q.Created,
				q.Updated,
				d.[Definition]
			FROM app.Query q
			JOIN app.QueryDefinition d on q.Id = d.QueryId
			WHERE (q.[Owner] = @user OR q.Id IN (SELECT Id FROM permitted))
				  AND q.UniversalId = @uid;
		END

    -- did not pass filter
    IF (SELECT COUNT(*) FROM @result) < 1
		BEGIN
			DECLARE @secmsg nvarchar(400) = @user + ' not permitted to query ' + @uid;
			THROW 70403, @secmsg, 1
		END;
    
    -- collect counts
    WITH counts (QueryId, Cnt) as (
        SELECT QueryId, Cnt = COUNT(*)
        FROM @result r
        JOIN app.Cohort c on r.Id = c.QueryId
        GROUP BY QueryId
    )
    UPDATE r
    SET [Count] = c.Cnt
    FROM @result r
    JOIN counts c on c.QueryId = r.Id;


    -- return
    SELECT
        Id,
        UniversalId,
        [Name],
        [Category],
        [Owner],
        Created,
        Updated,
        [Definition],
        [Count]
    FROM @result;
END
GO

/*
 * [app].[sp_InternalQuerySaveInitial]
 */
IF OBJECT_ID('app.sp_InternalQuerySaveInitial', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_InternalQuerySaveInitial];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Contains core logic for initial save functionality.
-- =======================================
CREATE PROCEDURE [app].[sp_InternalQuerySaveInitial]
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @ver int,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- update app.Query with name, category, universalid, remove nonce
    UPDATE app.Query
    SET
        Nonce = NULL,
		[Owner] = @user,
        [Name] = @name,
        Category = @category,
        UniversalId = @urn,
        Ver = @ver
    WHERE Id = @queryid;

    -- insert definition into app.QueryDefinition
    INSERT INTO app.QueryDefinition
    SELECT @queryid, @definition;

    -- insert dependencies into rela.QueryConceptDependency
    INSERT INTO rela.QueryConceptDependency
    SELECT @queryid, Id
    FROM @conceptids;
    
    -- insert dependencies into rela.QueryDependency
    INSERT INTO rela.QueryDependency
    SELECT @queryid, Id
    FROM @queryids;

END
GO

/*
 * [app].[sp_InternalQuerySaveUpdateMove]
 */
IF OBJECT_ID('app.sp_InternalQuerySaveUpdateMove', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_InternalQuerySaveUpdateMove];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Performs a resave of an existing query.
-- =======================================
CREATE PROCEDURE [app].[sp_InternalQuerySaveUpdateMove]
    @oldqueryid UNIQUEIDENTIFIER,
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @ver int,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @created table (
        created datetime
    );

    -- satisfy the FK
    UPDATE app.Query
    SET UniversalId = NULL
    OUTPUT deleted.Created INTO @created
    WHERE Id = @oldqueryid;

    -- delegate to sp_InternalQuerySaveInitial
    EXEC app.sp_InternalQuerySaveInitial @queryid, @urn, @ver, @name, @category, @conceptids, @queryids, @definition, @user;

    UPDATE app.Query
    SET Created = (SELECT TOP 1 created FROM @created)
    WHERE Id = @queryid;

    -- move constraints from oldqueryid that aren't already present
    INSERT INTO auth.QueryConstraint
    SELECT @queryid, ConstraintId, ConstraintValue
    FROM auth.QueryConstraint AS QC
    WHERE QueryId = @oldqueryid
		  AND NOT EXISTS (SELECT 1 
						  FROM auth.QueryConstraint AS NEWQC 
						  WHERE NEWQC.QueryId = @queryid
								AND QC.ConstraintId = NEWQC.ConstraintId 
								AND QC.ConstraintValue = NEWQC.ConstraintValue)

    -- cleanup the oldqueryid
    -- remove cached cohort
    DELETE FROM app.Cohort
    WHERE QueryId = @oldqueryid;

    -- unconstrain query
    DELETE FROM auth.QueryConstraint
    WHERE QueryId = @oldqueryid;

    -- delete definition
    DELETE FROM app.QueryDefinition
    WHERE QueryId = @oldqueryid;

    -- migrate dependents over to new id before deleting old deps
    UPDATE rela.QueryDependency
    SET DependsOn = @queryid
    WHERE DependsOn = @oldqueryid;

    -- update dependents definition to new id (search/replace)
    WITH directParents(QueryId) as (
        SELECT QueryId
        FROM rela.QueryDependency
        WHERE DependsOn = @oldqueryid
    )
    UPDATE app.QueryDefinition
    SET
        [Definition] = REPLACE([Definition], cast(@oldqueryid as [nvarchar](50)), cast(@queryid as [nvarchar](50)))
    WHERE QueryId IN (SELECT QueryId FROM directParents);

    -- delete dependencies
    DELETE FROM rela.QueryConceptDependency
    WHERE QueryId = @oldqueryid;

    DELETE FROM rela.QueryDependency
    WHERE QueryId = @oldqueryid;

    -- delete unsaved query
    DELETE FROM app.Query
    WHERE Id = @oldqueryid;
END
GO

/*
 * [app].[sp_DeleteQuery]
 */
IF OBJECT_ID('app.sp_DeleteQuery', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_DeleteQuery];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/6
-- Description: Deletes a query and all dependents (if forced).
-- =======================================
CREATE PROCEDURE [app].[sp_DeleteQuery]
    @uid app.UniversalId,
    @force bit,
    @user auth.[User],
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- make sure the user is the owner of the query and the query exists
    DECLARE @id UNIQUEIDENTIFIER, @owner nvarchar(1000);
    SELECT @id = Id, @owner = [Owner] FROM app.Query WHERE UniversalId = @uid;
    IF (@id IS NULL)
    BEGIN;
        DECLARE @404msg nvarchar(400) = N'Query ' + @uid + N' does not exist';
        THROW 70404, @404msg, 1;
    END;

    IF (@owner != @user AND @admin = 0)
    BEGIN;
        DECLARE @403msg1 nvarchar(400) = @user + N' does not own query ' + @uid;
        THROW 70403, @403msg1, 1;
    END;

    -- collect query dependents
    declare @dependentRefs table (
        Lvl int,
        QueryId UNIQUEIDENTIFIER,
        QueryUniversalId app.UniversalId,
        [QueryName] NVARCHAR(200),
        [Owner] NVARCHAR(1000),
        DependsOn UNIQUEIDENTIFIER
    );
    with cte (Lvl, QueryId, DependsOn) as (
        select 1, QueryId, DependsOn
        from rela.QueryDependency
        where DependsOn = @id
        union all
        select c.Lvl + 1, qd.QueryId, qd.DependsOn
        from rela.QueryDependency qd
        join cte c on qd.DependsOn = c.QueryId
    )
    insert into @dependentRefs
    select Lvl, QueryId, q.UniversalId, q.Name, q.[Owner], DependsOn
    from cte
    join app.Query q
        on cte.QueryId = q.Id;

    BEGIN TRAN;
    BEGIN TRY
        -- there are dependents
        IF EXISTS (SELECT 1 FROM @dependentRefs)
        BEGIN;
            -- no force, select enriched dependency graph
            IF (@force = 0)
            BEGIN;
                ROLLBACK;
                SELECT Id = QueryId, UniversalId = QueryUniversalId, [Name] = QueryName, [Owner]
                FROM @dependentRefs;
                RETURN;
            END;
            ELSE -- force it
            BEGIN;
                -- if there are any non user owned queries in the tree, bail with 403
                IF ((SELECT COUNT(*) FROM @dependentRefs WHERE [Owner] != @user) > 0)
                BEGIN;
                    declare @403msg2 nvarchar(400) = N'Query ' + @uid + N' has dependents owned by other users.';
                    throw 70403, @403msg2, 1;
                END;

                -- delete all dependents
                DECLARE @forceDeleteId UNIQUEIDENTIFIER;
                DECLARE force_cursor CURSOR FOR
                SELECT QueryId
                FROM @dependentRefs
                ORDER BY Lvl DESC;

                OPEN force_cursor;

                FETCH NEXT FROM force_cursor
                INTO @forceDeleteId;

                WHILE @@FETCH_STATUS = 0
                BEGIN;
                    DELETE FROM auth.QueryConstraint
                    WHERE QueryId = @forceDeleteId;

                    DELETE FROM rela.QueryConceptDependency
                    WHERE QueryId = @forceDeleteId;

                    DELETE FROM rela.QueryDependency
                    WHERE QueryId = @forceDeleteId;

                    DELETE FROM app.QueryDefinition
                    WHERE QueryId = @forceDeleteId;

					DELETE FROM app.Cohort
					WHERE QueryId = @forceDeleteId

                    DELETE FROM app.Query
                    WHERE Id = @forceDeleteId;

                    FETCH NEXT FROM force_cursor
                    INTO @forceDeleteId;
                END;

                CLOSE force_cursor;
                DEALLOCATE force_cursor;
            END;
        END;
        -- delete the constraint, dependencies, querydefinition, query
        DELETE FROM auth.QueryConstraint
        WHERE QueryId = @id;

        DELETE FROM rela.QueryConceptDependency
        WHERE QueryId = @id;

        DELETE FROM rela.QueryDependency
        WHERE QueryId = @id;

        DELETE FROM app.QueryDefinition
        WHERE QueryId = @id;

		DELETE FROM app.Cohort
		WHERE QueryId = @id

        DELETE FROM app.Query
        WHERE Id = @id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

    SELECT Id = QueryId, UniversalId = QueryUniversalId, [Name] = QueryName, [Owner]
    FROM @dependentRefs
    WHERE 0 = 1;
END
GO