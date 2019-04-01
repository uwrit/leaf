/****** Object:  StoredProcedure [adm].[sp_CreateConceptSqlSet]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/8/3
-- Description: Creates a new ConceptSqlSet.
-- =======================================
ALTER PROCEDURE [adm].[sp_CreateConceptSqlSet]
    @isEncounterBased bit,
    @isEventBased bit,
    @sqlSetFrom nvarchar(1000),
    @sqlFieldDate nvarchar(1000),
    @sqlFieldEventId nvarchar(400),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@sqlSetFrom IS NULL OR LEN(@sqlSetFrom) = 0)
        THROW 70409, N'ConceptSqlSet.SqlSetFrom is required.', 1;

    INSERT INTO app.ConceptSqlSet (IsEncounterBased, IsEventBased, SqlSetFrom, SqlFieldDate, SqlFieldEventId)
    OUTPUT inserted.Id, inserted.IsEncounterBased, inserted.IsEventBased, inserted.SqlSetFrom, inserted.SqlFieldDate, inserted.SqlFieldEventId
    SELECT @isEncounterBased, @isEventBased, @sqlSetFrom, @sqlFieldDate, @sqlFieldEventId
END


GO
/****** Object:  StoredProcedure [adm].[sp_CreateSpecialization]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Create a new app.Specialization.
-- =======================================
ALTER PROCEDURE [adm].[sp_CreateSpecialization]
    @groupId int,
    @uid app.UniversalId,
    @uiDisplayText nvarchar(100),
    @sqlSetWhere nvarchar(1000),
    @order int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@groupId IS NULL)
        THROW 70400, N'Specialization.SpecializationGroupId is required.', 1;
    
    IF (@uiDisplayText IS NULL OR LEN(@uiDisplayText) = 0)
        THROW 70400, N'Specialization.UiDisplayText is required.', 1;

    IF (@sqlSetWhere IS NULL OR LEN(@sqlSetWhere) = 0)
        THROW 70400, N'Specialization.SqlSetWhere is required.', 1;

    IF NOT EXISTS (SELECT 1 FROM app.SpecializationGroup WHERE Id = @groupId)
        THROW 70409, N'SpecializationGroup is missing.', 1;

    INSERT INTO app.Specialization (SpecializationGroupId, UniversalId, UiDisplayText, SqlSetWhere, OrderId)
    OUTPUT inserted.Id, inserted.SpecializationGroupId, inserted.UniversalId, inserted.UiDisplayText, inserted.SqlSetWhere, inserted.OrderId
    VALUES (@groupId, @uid, @uiDisplayText, @sqlSetWhere, @order);
END


GO
/****** Object:  StoredProcedure [adm].[sp_CreateSpecializationGroup]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/12
-- Description: Create a new app.SpecializationGroup with associated (if any) app.Specialization.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateSpecializationGroup]
    @sqlSetId int,
    @uiDefaultText nvarchar(100),
    @specs app.SpecializationTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- validate
    IF (@sqlSetId is null)
        THROW 70400, N'SpecializationGroup.SqlSetId is missing.', 1;
    
    IF (@uiDefaultText is null OR LEN(@uiDefaultText) = 0)
        THROW 70400, N'SpecializationGroup.UiDefaultText is required.', 1;

    IF EXISTS(SELECT 1 FROM @specs WHERE UiDisplayText IS NULL OR LEN(UiDisplayText) = 0 OR SqlSetWhere IS NULL OR LEN(SqlSetWhere) = 0)
        THROW 70400, N'Malformed Specialization.', 1;

    IF NOT EXISTS(SELECT 1 FROM app.ConceptSqlSet WHERE Id = @sqlSetId)
        THROW 70404, N'ConceptSqlSet is missing.', 1;

    BEGIN TRAN;

    DECLARE @g TABLE (
        Id int not null,
        SqlSetId int not null,
        UiDefaultText nvarchar(100) not null
    );

    INSERT INTO app.SpecializationGroup (SqlSetId, UiDefaultText, LastChanged, ChangedBy)
    OUTPUT inserted.Id, inserted.SqlSetId, inserted.UiDefaultText INTO @g
    SELECT @sqlSetId, @uiDefaultText, GETDATE(), @user;

    DECLARE @id int
    SELECT TOP 1 @id = Id FROM @g;

    DECLARE @s TABLE (
        Id UNIQUEIDENTIFIER not null,
        SpecializationGroupId int not null,
        UniversalId nvarchar(200) null,
        UiDisplayText nvarchar(100) not null,
        SqlSetWhere nvarchar(1000) not null,
        OrderId int null
    )

    INSERT INTO app.Specialization (SpecializationGroupId, UniversalId, UiDisplayText, SqlSetWhere, OrderId)
    OUTPUT inserted.Id, inserted.SpecializationGroupId, inserted.UniversalId, inserted.UiDisplayText, inserted.SqlSetWhere, inserted.OrderId INTO @s
    SELECT @id, UniversalId, UiDisplayText, SqlSetWhere, OrderId
    FROM @specs;

    COMMIT;

    SELECT Id, SqlSetId, UiDefaultText
    FROM @g;

    SELECT Id, SpecializationGroupId, UniversalId, UiDisplayText, SqlSetWhere, OrderId
    FROM @s;

END



GO
/****** Object:  StoredProcedure [adm].[sp_DeleteConceptSqlSet]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/8/3
-- Description: Deletes an app.ConceptSqlSet by id.
-- =======================================
ALTER PROCEDURE [adm].[sp_DeleteConceptSqlSet]
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.ConceptSqlSet WHERE Id = @id)
        THROW 70404, N'app.ConceptSqlSet is missing.', 1;

    BEGIN TRAN;
    BEGIN TRY
        DELETE FROM app.ConceptSqlSet
        WHERE Id = @id;

        COMMIT;

        SELECT Id = NULL, UniversalId = NULL, UiDisplayName = NULL
        WHERE 0 = 1;

        SELECT Id = NULL, UiDefaultText = NULL
        WHERE 0 = 1;
    END TRY
    BEGIN CATCH
        DECLARE @concepts TABLE (
            Id UNIQUEIDENTIFIER,
            UniversalId app.UniversalId NULL,
            UiDisplayName nvarchar(400) NULL
        );
        INSERT INTO @concepts
        SELECT Id, UniversalId, UiDisplayName
        FROM app.Concept
        WHERE app.Concept.SqlSetId = @id;

        DECLARE @specs TABLE (
            Id int,
            UiDefaultText nvarchar(100) NULL
        );
        INSERT INTO @specs
        SELECT Id, UiDefaultText
        FROM app.SpecializationGroup
        WHERE SqlSetId = @id;
        
        ROLLBACK;

        IF EXISTS(SELECT 1 FROM @concepts) OR EXISTS(SELECT 1 FROM @specs)
        BEGIN;
            SELECT Id, UniversalId, UiDisplayName
            FROM @concepts;

            SELECT Id, UiDefaultText
            FROM @specs;
            RETURN;
        END;
        THROW;
    END CATCH;
END




GO
/****** Object:  StoredProcedure [adm].[sp_DeleteSpecialization]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Deletes an app.Specialization by id.
-- =======================================
ALTER PROCEDURE [adm].[sp_DeleteSpecialization]
    @id UNIQUEIDENTIFIER,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM app.Specialization
    OUTPUT deleted.Id, deleted.SpecializationGroupId, deleted.UniversalId, deleted.UiDisplayText, deleted.SqlSetWhere, deleted.OrderId
    WHERE Id = @id;
END



GO
/****** Object:  StoredProcedure [adm].[sp_DeleteSpecializationGroup]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/14
-- Description: Deletes an app.SpecializationGroup and associated app.Specialization if FKs are satisfied.
-- =======================================
ALTER PROCEDURE [adm].[sp_DeleteSpecializationGroup]
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.SpecializationGroup WHERE Id = @id)
        THROW 70404, N'SpecializationGroup not found.', 1;

    BEGIN TRAN;

    DECLARE @deps TABLE (
        Id UNIQUEIDENTIFIER NOT NULL,
        UniversalId nvarchar(200) NULL,
        UiDisplayName nvarchar(400) NULL
    );
    SELECT c.Id, c.UniversalId, c.UiDisplayName
    FROM app.Concept c
    JOIN rela.ConceptSpecializationGroup csg ON c.Id = csg.ConceptId
    WHERE csg.SpecializationGroupId = @id;

    IF EXISTS(SELECT 1 FROM @deps)
    BEGIN;
        -- there are dependents, bail
        ROLLBACK;

        SELECT Id, UniversalId, UiDisplayName
        FROM @deps;

        RETURN;
    END;

    DELETE FROM app.Specialization
    WHERE SpecializationGroupId = @id;

    DELETE FROM app.SpecializationGroup
    WHERE Id = @id;

    COMMIT;

    SELECT Id = NULL, UniversalId = NULL, UiDisplayName = NULL
    WHERE 0 = 1;

END


GO
/****** Object:  StoredProcedure [adm].[sp_GetConceptById]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/19
-- Description: Retrieve a fully hydrated Admin.Concept by Id.
-- =======================================
ALTER PROCEDURE [adm].[sp_GetConceptById]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    -- select concept
    SELECT 
        Id,
        UniversalId,
        ParentId,
        RootId,
        ExternalId,
        ExternalParentId,
        SqlSetId,
        [IsNumeric],
        IsParent,
        IsPatientCountAutoCalculated,
        IsSpecializable,
        SqlSetWhere,
        SqlFieldNumeric,
        UiDisplayName,
        UiDisplayText,
        UiDisplaySubtext,
        UiDisplayUnits,
        UiDisplayTooltip,
        UiDisplayPatientCount,
        UiDisplayPatientCountByYear,
        UiNumericDefaultText
    FROM app.Concept
    WHERE Id = @id;

    -- select specializationgroupids
    SELECT
        SpecializationGroupId,
        OrderId
    FROM rela.ConceptSpecializationGroup csg
    WHERE csg.ConceptId = @id;

    -- select constraints
    SELECT
        ConceptId,
        ConstraintId,
        ConstraintValue
    FROM auth.ConceptConstraint
    WHERE ConceptId = @id;

END


GO
/****** Object:  StoredProcedure [adm].[sp_GetConceptSqlSets]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/7
-- Description: Gets all app.ConceptSqlSet records.
-- =======================================
ALTER PROCEDURE [adm].[sp_GetConceptSqlSets]    
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        Id,
        IsEncounterBased,
        IsEventBased,
        SqlSetFrom,
        SqlFieldDate,
        SqlFieldEventId
    FROM
        app.ConceptSqlSet;
END


GO
/****** Object:  StoredProcedure [adm].[sp_GetSpecializationGroups]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/13
-- Description: Gets all app.SpecializationGroup and associated app.Specialization.
-- =======================================
ALTER PROCEDURE [adm].[sp_GetSpecializationGroups]
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        Id,
        SqlSetId,
        UiDefaultText
    FROM app.SpecializationGroup;

    SELECT
        Id,
        SpecializationGroupId,
        UniversalId,
        UiDisplayText,
        SqlSetWhere,
        OrderId
    FROM app.Specialization;
END


GO
/****** Object:  StoredProcedure [adm].[sp_GetSpecializationsByGroupId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Gets all app.Specialization by SpecializationGroupId.
-- =======================================
ALTER PROCEDURE [adm].[sp_GetSpecializationsByGroupId]
    @groupId int
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @s TABLE (
        Id UNIQUEIDENTIFIER not null,
        SpecializationGroupId int not null,
        UniversalId nvarchar(200),
        UiDisplayText nvarchar(100) not null,
        SqlSetWhere nvarchar(1000) not null,
        OrderId int
    )

    INSERT INTO @s
    SELECT
        Id,
        SpecializationGroupId,
        UniversalId,
        UiDisplayText,
        SqlSetWhere,
        OrderId
    FROM app.Specialization
    WHERE SpecializationGroupId = @groupId;

    IF NOT EXISTS(SELECT 1 FROM @s) AND NOT EXISTS(SELECT 1 FROM app.SpecializationGroup WHERE Id = @groupId)
        THROW 70404, N'SpecializationGroup is missing.', 1;
    
    SELECT
        Id,
        SpecializationGroupId,
        UniversalId,
        UiDisplayText,
        SqlSetWhere,
        OrderId
    FROM @s;
END



GO
/****** Object:  StoredProcedure [adm].[sp_UpdateConceptSqlSet]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/8/3
-- Description: Updates an app.ConceptSqlSet.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateConceptSqlSet]
    @id int,
    @isEncounterBased bit,
    @isEventBased bit,
    @sqlSetFrom nvarchar(1000),
    @sqlFieldDate nvarchar(1000),
    @sqlFieldEventId nvarchar(400),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL OR @id = 0)
        THROW 70400, N'ConceptSqlSet.Id is required.', 1;
    
    IF (@sqlSetFrom IS NULL OR LEN(@sqlSetFrom) = 0)
        THROW 70400, N'ConceptSqlSet.SqlSetFrom is required.', 1;

    UPDATE app.ConceptSqlSet
    SET
        IsEncounterBased = @isEncounterBased,
        IsEventBased = @isEventBased,
        SqlSetFrom = @sqlSetFrom,
        SqlFieldDate = @sqlFieldDate,
        SqlFieldEventId = @sqlFieldEventId
    OUTPUT inserted.Id, inserted.IsEncounterBased, inserted.IsEventBased, inserted.SqlSetFrom, inserted.SqlFieldDate, inserted.SqlFieldEventId
    WHERE Id = @id;
END




GO
/****** Object:  StoredProcedure [adm].[sp_UpdateSpecialization]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Updates an app.Specialization.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateSpecialization]
    @id UNIQUEIDENTIFIER,
    @groupId int,
    @uid app.UniversalId,
    @uiDisplayText nvarchar(100),
    @sqlSetWhere nvarchar(1000),
    @order int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@groupId IS NULL)
        THROW 70400, N'Specialization.SpecializationGroupId is required.', 1;

    IF (@uiDisplayText IS NULL OR LEN(@uiDisplayText) = 0)
        THROW 70400, N'Specialization.UiDisplayText is required', 1;
    
    IF (@sqlSetWhere IS NULL OR LEN(@sqlSetWhere) = 0)
        THROW 70400, N'Specialization.SqlSetWhere is required.', 1;

    UPDATE app.Specialization
    SET
        SpecializationGroupId = @groupId,
        UniversalId = @uid,
        UiDisplayText = @uiDisplayText,
        SqlSetWhere = @sqlSetWhere,
        OrderId = @order
    OUTPUT inserted.Id, inserted.SpecializationGroupId, inserted.UniversalId, inserted.UiDisplayText, inserted.SqlSetWhere, inserted.OrderId
    WHERE
        Id = @id;

END


GO
/****** Object:  StoredProcedure [adm].[sp_UpdateSpecializationGroup]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/14
-- Description: Updates an app.SpecializationGroup.
-- =======================================
ALTER PROCEDURE [adm].[sp_UpdateSpecializationGroup]
    @id int,
    @sqlSetId int,
    @uiDefaultText nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'SpecializationGroup.Id is required.', 1;

    IF (@sqlSetId IS NULL)
        THROW 70400, N'SpecializationGroup.SqlSetId is required.', 1;

    IF (@uiDefaultText IS NULL OR LEN(@uiDefaultText) = 0)
        THROW 70400, N'SpecializationGroup.UiDefaultText is required.', 1;

    IF NOT EXISTS(SELECT 1 FROM app.ConceptSqlSet WHERE Id = @sqlSetId)
        THROW 70404, N'ConceptSqlSet is missing.', 1;
    
    UPDATE app.SpecializationGroup
    SET
        SqlSetId = @sqlSetId,
        UiDefaultText = @uiDefaultText,
        LastChanged = GETDATE(),
        ChangedBy = @user
    OUTPUT inserted.Id, inserted.SqlSetId, inserted.UiDefaultText
    WHERE Id = @id;
END



GO
/****** Object:  StoredProcedure [app].[sp_CalculateConceptPatientCount]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [app].[sp_CalculateConceptPatientCount]
	@PersonIdField NVARCHAR(50),
	@TargetDatabaseName NVARCHAR(100),
	@From NVARCHAR(MAX),
	@Where NVARCHAR(MAX),
	@Date NVARCHAR(200),
	@isEncounterBased BIT,
	@CurrentRootId [uniqueidentifier],
	@CurrentConceptId [uniqueidentifier]
AS
BEGIN

	DECLARE @ExecuteSql NVARCHAR(MAX),
			@Result NVARCHAR(MAX),
			@ParameterDefinition NVARCHAR(MAX)= N'@TotalPatientsOUT INT OUTPUT',
			@PatientsByYearParameterDefinition NVARCHAR(MAX)= N'@TotalPatientsByYearOUT NVARCHAR(MAX) OUTPUT'
	
	BEGIN 
			
			------------------------------------------------------------------------------------------------------------------------------ 
			-- Total Patient Count
			------------------------------------------------------------------------------------------------------------------------------
			SELECT @ExecuteSql = 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;  
			
							      SELECT @TotalPatientsOUT = (SELECT COUNT(DISTINCT _T.' + @PersonIdField + ') ' +
															 'FROM ' + @TargetDatabaseName + '.' + @From + ' _T ' +
															  ISNULL('WHERE ' + @Where,'') + 
															')'

			BEGIN TRY 
			
				EXECUTE sp_executesql 
					@ExecuteSql,
					@ParameterDefinition,
					@TotalPatientsOUT = @Result OUTPUT

				UPDATE app.Concept
				SET UiDisplayPatientCount = TRY_PARSE(@Result AS INT)
				  , PatientCountLastUpdateDateTime = GETDATE()
				WHERE Id = @CurrentConceptId

			END TRY 
			
			BEGIN CATCH 

				PRINT('Failed to run query for ' + CONVERT(NVARCHAR(50),@CurrentConceptId));
				PRINT('Failed query: ' + @ExecuteSql);
				PRINT('Error: ' + ERROR_MESSAGE())
				PRINT('')

			END CATCH

			------------------------------------------------------------------------------------------------------------------------------ 
			-- Patient Count by Year
			------------------------------------------------------------------------------------------------------------------------------

			IF (@isEncounterBased = 1 AND TRY_CONVERT(INT, @Result) > 0)
			
				BEGIN
				
					-- Output to the @TotalPatientsByYear (JSON) parameter to log the result
					SET @ExecuteSql = 
								'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;  
								 
								 WITH year_calculation AS
									  (SELECT PatientYear = CASE WHEN YEAR(' + @Date + ') < 1995 THEN ''<1995''
																	   WHEN YEAR(' + @Date + ') > YEAR(GETDATE()) THEN ''z>'' + CONVERT(NVARCHAR(10),YEAR(GETDATE()))
																	   WHEN ' + @Date + ' IS NULL THEN ''_?''
																	   ELSE CONVERT(NVARCHAR(10),YEAR(' + @Date + ')) END
											, _T.' + @PersonIdField +'
									   FROM ' + @From + ' _T 
									   WHERE ' + ISNULL(@Where,'') + ')
									  
									, year_grouping AS
									  (SELECT PatientYear
											, PatientCount = COUNT(DISTINCT ' + @PersonIdField + ')
									   FROM year_calculation
									   GROUP BY PatientYear)

								SELECT @TotalPatientsByYearOUT = (' + 
										 '''['' + STUFF(
		  										(SELECT ''{"Year":'' + PatientYear + '',"PatientCount":'' + CONVERT(NVARCHAR(20),PatientCount) + ''},'' 
		  										 FROM year_grouping
												 WHERE PatientCount > 0
												 ORDER BY PatientYear
		  										 FOR XML PATH(''''), TYPE).value(''text()[1]'', ''varchar(MAX)''
												 ), 1, 0, '''') +
										'']'')'
	
					BEGIN TRY 

						PRINT(@ExecuteSql)
			
						EXECUTE sp_executesql 
							@ExecuteSql,
							@PatientsByYearParameterDefinition,
							@TotalPatientsByYearOUT = @Result OUTPUT

						-- Clean up JSON by removing last unnecessary comma
						SET @Result = REPLACE(REPLACE(LEFT(@Result, LEN(@Result) - 2) + ']','_',''),'z','')

						UPDATE app.Concept
						SET UiDisplayPatientCountByYear = @Result
						WHERE Id = @CurrentConceptId

					END TRY 
			
					BEGIN CATCH 
			
						PRINT('Failed to run query for ' + CONVERT(NVARCHAR(50),@CurrentConceptId));
						PRINT('Failed query: ' + @ExecuteSql);
						PRINT('Error: ' + ERROR_MESSAGE())
						PRINT('')

					END CATCH

				END

		END 

END




GO
/****** Object:  StoredProcedure [app].[sp_CreateCachedUnsavedQuery]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/13
-- Description: Creates and constrains a new Unsaved Query.
-- =======================================
ALTER PROCEDURE [app].[sp_CreateCachedUnsavedQuery]
    @user auth.[User],
    @nonce UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @qid UNIQUEIDENTIFIER;
    DECLARE @qids TABLE
    (
        QueryId UNIQUEIDENTIFIER NOT NULL
    );

    -- clear out previous cohort cache
    EXEC app.sp_DeleteCachedUnsavedQueryByNonce @user, @nonce;

    BEGIN TRAN;

    -- create the query
    INSERT INTO app.Query (UniversalId, Nonce, [Owner])
    OUTPUT inserted.Id INTO @qids
    VALUES (null, @nonce, @user)

    -- get the id
    SELECT TOP 1
        @qid = QueryId
    FROM @qids;

    -- constrain the query
    INSERT INTO auth.QueryConstraint (QueryId, ConstraintId, ConstraintValue)
    VALUES (@qid, 1, @user);

    COMMIT TRAN;

    SELECT @qid;
END











GO
/****** Object:  StoredProcedure [app].[sp_DeleteCachedUnsavedQueryByNonce]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/10
-- Description: Deletes a user's previous cached cohort and query by Nonce
-- =======================================
ALTER PROCEDURE [app].[sp_DeleteCachedUnsavedQueryByNonce]
    @user auth.[User],
    @nonce UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @qid UNIQUEIDENTIFIER;
    DECLARE @owner nvarchar(200);

    -- Ensure an Atomic Operation as there are many steps here
    BEGIN TRAN;
    
    -- convert Nonce into queryid IF AND ONLY IF the user owns the query
    SELECT
        @qid = Id,
        @owner = [Owner]
    FROM app.Query
    WHERE Nonce = @nonce;

    -- query not found, just rollback and bounce
    IF (@qid is null)
    BEGIN;
        ROLLBACK TRAN;
        RETURN 0;
    END;

    -- query found but not owned
    IF (@owner != @user)
    BEGIN;
        DECLARE @security nvarchar(200) = @user + ' cannot delete query ' + cast(@qid as nvarchar(50));
        THROW 70403, @security, 1;
    END;

    -- remove cached cohort
    DELETE FROM app.Cohort
    WHERE QueryId = @qid;

    -- unconstrain query
    DELETE FROM auth.QueryConstraint
    WHERE QueryId = @qid;

    -- delete unsaved query
    DELETE FROM app.Query
    WHERE Id = @qid;
    
    COMMIT TRAN;

END
















GO
/****** Object:  StoredProcedure [app].[sp_DeleteQuery]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/6
-- Description: Deletes a query and all dependents (if forced).
-- =======================================
ALTER PROCEDURE [app].[sp_DeleteQuery]
    @uid app.UniversalId,
    @force bit,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- make sure the user is the owner of the query and the query exists
    DECLARE @id UNIQUEIDENTIFIER, @owner nvarchar(200);
    SELECT @id = Id, @owner = [Owner] FROM app.Query WHERE UniversalId = @uid;
    IF (@id IS NULL)
    BEGIN;
        DECLARE @404msg nvarchar(400) = N'Query ' + @uid + N' does not exist';
        THROW 70404, @404msg, 1;
    END;

    IF (@owner != @user)
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
        [Owner] NVARCHAR(200),
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
/****** Object:  StoredProcedure [app].[sp_FilterConceptsByConstraint]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/2
-- Description: Recursively (ancestry applies) filters a list of concept ids by ConceptConstraint relationships.
-- =======================================
ALTER PROCEDURE [app].[sp_FilterConceptsByConstraint]
    @user [auth].[User],
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

    DECLARE @ancestry table
    (
        [Base] [uniqueidentifier] not null,
        [Current] [uniqueidentifier] not null,
        [Parent] [uniqueidentifier] null
    );

    -- Fetch the full ancestry of all requested Ids.
    WITH recRoots (Base, Id, ParentId) as
    (
        SELECT i.Id, i.Id, c.Parentid
        FROM @requested i
        JOIN app.Concept c on i.Id = c.Id

        UNION ALL

        SELECT r.Base, c.Id, c.ParentId
        FROM app.Concept c
        JOIN recRoots r on c.Id = r.ParentId
    )
    INSERT INTO @ancestry
    SELECT Base, Id, ParentId
    FROM recRoots;

    -- Identify any requested Ids that are disallowed by constraint anywhere in their ancestry.
    DECLARE @disallowed app.ResourceIdTable;
    INSERT INTO @disallowed
    SELECT DISTINCT
        a.Base
    FROM @ancestry a
    JOIN auth.ConceptConstraint c on a.[Current] = c.ConceptId and c.ConstraintId = 1 -- User Constrained
    WHERE @user NOT IN (
        SELECT ConstraintValue
        FROM auth.ConceptConstraint
        WHERE ConceptId = c.ConceptId
        AND c.ConstraintId = 1
    )
    UNION
    SELECT DISTINCT
        a.Base
    FROM @ancestry a
    JOIN auth.ConceptConstraint c on a.[Current] = c.ConceptId and c.ConstraintId = 2 -- Group Constrained
    WHERE NOT EXISTS (
        SELECT 1 FROM @groups WHERE [Group] = c.ConstraintValue
    );

    -- Select only the allowed requested ids.
    SELECT Id
    FROM @requested
    WHERE Id NOT IN (
        SELECT Id
        FROM @disallowed
    );

END











GO
/****** Object:  StoredProcedure [app].[sp_GetChildConceptsByParentId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/7/2
-- Description: Retrieves children concepts of the given parent concept.
-- =======================================
ALTER PROCEDURE [app].[sp_GetChildConceptsByParentId]
    @parentId UNIQUEIDENTIFIER,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- ensure user can see parent
    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT @parentId;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    IF ((SELECT COUNT(*) FROM @allowed) != 1)
        THROW 70403, 'User is not permitted.', 1;

    -- clear tables for reuse
    DELETE FROM @requested;
    DELETE FROM @allowed;

    -- ensure only permitted children are returned
    INSERT INTO @requested
    SELECT
        Id
    FROM app.Concept
    WHERE ParentId = @parentId;

    -- TODO(cspital) this is wasteful, we've already checked parent up to root, just need to check children, write focused version with no recursion
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin

    EXEC app.sp_HydrateConceptsByIds @allowed;

END














GO
/****** Object:  StoredProcedure [app].[sp_GetConceptById]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/7/2
-- Description: Retrieves a concept directly by Id.
-- =======================================
ALTER PROCEDURE [app].[sp_GetConceptById]
    @id [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceIdTable;

    INSERT INTO @requested
    SELECT @id;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    IF ((SELECT COUNT(*) FROM @allowed) != 1)
        THROW 70403, 'User is not permitted.', 1;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END















GO
/****** Object:  StoredProcedure [app].[sp_GetConceptHintsBySearchTerms]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Authors:     Nic Dobbins
-- Create date: 2019/3/23
-- Description: Retrieves a list of concept hints for the given search terms.
-- =======================================
ALTER PROCEDURE [app].[sp_GetConceptHintsBySearchTerms]
    @terms app.SearchTermTable READONLY,
    @rootId [uniqueidentifier] = NULL,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @requested app.ResourceIdTable
	DECLARE @allowed app.ResourceIdTable
    DECLARE @initialTerm NVARCHAR(30) = (SELECT TOP (1) Term FROM @terms)
	DECLARE @termLastIdx INT = (SELECT COUNT(*) FROM @terms) - 1

	/*
	 * Find hits for initial term.
	 */
	; WITH cte AS 
	(
		SELECT FI.ConceptId, FI.Word, Lvl = 0
		FROM app.ConceptForwardIndex FI
		WHERE (@rootId IS NULL OR FI.RootId = @rootId)
			  AND EXISTS 
			(
				SELECT 1
				FROM app.ConceptInvertedIndex II
				WHERE II.Word LIKE @initialTerm + '%'
					  AND FI.WordId = II.WordId
			)
	)

	/*
	 * Recurse through following terms.
	 */
	, cte2 AS
	(
		SELECT ConceptId, Lvl
		FROM cte

		UNION ALL

		SELECT cte2.ConceptId, Lvl = cte2.Lvl + 1
		FROM cte2
		WHERE EXISTS 
			(
				SELECT 1
				FROM app.ConceptForwardIndex FI
				WHERE cte2.ConceptId = FI.ConceptId
					  AND (@rootId IS NULL OR FI.RootId = @rootId)
					  AND EXISTS 
							(
								SELECT 1
								FROM @terms T 
									 INNER JOIN app.ConceptInvertedIndex II
										ON II.Word LIKE T.Term + '%'
								WHERE FI.WordId = II.WordId
									  AND T.Id = cte2.Lvl + 1
							)
			)
	)

	/*
	 * Limit to only TOP 100 Concepts that matched all terms.
	 */
	, cte3 AS
	(
		SELECT TOP (100) ConceptId
		FROM cte2
		WHERE Lvl = @termLastIdx
	)

	INSERT INTO @requested
	SELECT ConceptId
	FROM cte3

	/*
	 * Filter out any Concepts not allowed for user.
	 */
	INSERT INTO @allowed
	EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

	/*
	 * Return matches and their JSON tokens.
	 */
	SELECT TI.ConceptId
		 , TI.JsonTokens
	FROM app.ConceptTokenizedIndex TI
	WHERE EXISTS (SELECT 1 FROM @allowed A WHERE TI.ConceptId = A.Id)

END



GO
/****** Object:  StoredProcedure [app].[sp_GetConceptsByIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/3
-- Description: Retrieves Concepts requested, filtered by constraint.
-- =======================================
ALTER PROCEDURE [app].[sp_GetConceptsByIds]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @allowed app.ResourceIdTable;

    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @ids, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END












GO
/****** Object:  StoredProcedure [app].[sp_GetConceptsBySearchTerms]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Author:      Nic Dobbins; Ported by Cliff Spital
-- Create date: 2018/6/27
-- Description: Retrieves concepts matching the given search terms.
-- Old name:    sp_GetSearchConceptsByTerm
-- =======================================
ALTER PROCEDURE [app].[sp_GetConceptsBySearchTerms]
    @terms app.SearchTermTable READONLY,
    @rootId [uniqueidentifier] = NULL,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceIdTable
	DECLARE @allowed app.ResourceIdTable
    DECLARE @initialTerm NVARCHAR(30) = (SELECT TOP (1) Term FROM @terms)
	DECLARE @termLastIdx INT = (SELECT COUNT(*) FROM @terms) - 1

	/*
	 * Find hits for initial term.
	 */
	; WITH cte AS 
	(
		SELECT FI.ConceptId, FI.Word, Lvl = 0
		FROM app.ConceptForwardIndex FI
		WHERE (@rootId IS NULL OR FI.RootId = @rootId)
			  AND EXISTS 
			(
				SELECT 1
				FROM app.ConceptInvertedIndex II
				WHERE II.Word LIKE @initialTerm + '%'
					  AND FI.WordId = II.WordId
			)
	)

	/*
	 * Recurse through following terms.
	 */
	, cte2 AS
	(
		SELECT ConceptId, Lvl
		FROM cte

		UNION ALL

		SELECT cte2.ConceptId, Lvl = cte2.Lvl + 1
		FROM cte2
		WHERE EXISTS 
			(
				SELECT 1
				FROM app.ConceptForwardIndex FI
				WHERE cte2.ConceptId = FI.ConceptId
					  AND (@rootId IS NULL OR FI.RootId = @rootId)
					  AND EXISTS 
							(
								SELECT 1
								FROM @terms T 
									 INNER JOIN app.ConceptInvertedIndex II
										ON II.Word LIKE T.Term + '%'
								WHERE FI.WordId = II.WordId
									  AND T.Id = cte2.Lvl + 1
							)
			)
	)

	/*
	 * Limit to only TOP 100 Concepts that matched all terms.
	 */
	, cte3 AS
	(
		SELECT TOP (100) ConceptId
		FROM cte2
		WHERE Lvl = @termLastIdx
	)

	INSERT INTO @requested
	SELECT ConceptId
	FROM cte3

	/*
	 * Filter out any Concepts not allowed for user.
	 */
	INSERT INTO @allowed
	EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    EXEC app.sp_GetParentConceptsByChildIds @allowed, @user, @groups, @admin = @admin;

END



GO
/****** Object:  StoredProcedure [app].[sp_GetConceptsByUIds]    Script Date: 3/29/19 11:06:35 AM ******/
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
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextByDatasetIdQueryUId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.UniversalId and DatasetQuery.Id.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetContextByDatasetIdQueryUId]
    @datasetid UNIQUEIDENTIFIER,
    @queryuid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.Query
    WHERE app.Query.UniversalId = @queryuid;

    EXEC app.sp_GetDatasetContextById @datasetid, @qid, @user, @groups;
END





GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextByDatasetUIdQueryId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/6
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.Id and DatasetQuery.UniversalId.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetContextByDatasetUIdQueryId]
    @datasetuid app.UniversalId,
    @queryid UNIQUEIDENTIFIER,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- convert datasetuid to datasetid
    DECLARE @did UNIQUEIDENTIFIER;
    SELECT TOP 1 @did = Id
    FROM app.DatasetQuery
    WHERE app.DatasetQuery.UniversalId = @datasetuid;

    -- do the normal thing
    EXEC app.sp_GetDatasetContextById @did, @queryid, @user, @groups;
END





GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextByDatasetUIdQueryUId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/6
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.UniversalId and DatasetQuery.UniversalId.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetContextByDatasetUIdQueryUId]
    @datasetuid app.UniversalId,
    @queryuid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- convert datasetuid to datasetid
    DECLARE @did UNIQUEIDENTIFIER;
    SELECT TOP 1 @did = Id
    FROM app.DatasetQuery
    WHERE app.DatasetQuery.UniversalId = @datasetuid;

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.DatasetQuery
    WHERE app.DatasetQuery.UniversalId = @queryuid;

    -- do the normal thing
    EXEC app.sp_GetDatasetContextById @did, @qid, @user, @groups;
END





GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextById]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.Id and DatasetQuery.Id.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetContextById]
    @datasetid UNIQUEIDENTIFIER,
    @queryid UNIQUEIDENTIFIER,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- queryconstraint ok?
    IF (auth.fn_UserIsAuthorizedForQueryById(@user, @groups, @queryid) = 0)
    BEGIN;
        DECLARE @query403 nvarchar(400) = @user + N' is not authorized to execute query ' + app.fn_StringifyGuid(@queryid);
        THROW 70403, @query403, 1;
    END;

    -- datasetconstraint ok?
    IF (auth.fn_UserIsAuthorizedForDatasetQueryById(@user, @groups, @datasetid) = 0)
    BEGIN;
        DECLARE @dataset403 nvarchar(400) = @user + N' is not authorized to execute dataset ' +  + app.fn_StringifyGuid(@datasetid);
        THROW 70403, @dataset403, 1;
    END;

    -- get pepper
    SELECT
        QueryId = Id,
        Pepper
    FROM
        app.Query
    WHERE Id = @queryid;

    -- get datasetquery
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









GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetQueries]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/21
-- Description: Retrieves all DatasetQuery records to which the user is authorized.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDatasetQueries]
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    declare @ids table (
        Id UNIQUEIDENTIFIER NOT NULL
    );

    -- store ids, then hydrate the records and reuse to get the tags
    insert into @ids (Id)
    select distinct
        dq.Id
    from app.DatasetQuery dq
    where exists (
        select 1
        from auth.DatasetQueryConstraint
        where DatasetQueryId = dq.Id and
        ConstraintId = 1 and
        ConstraintValue = @user
    )
    or exists (
        select 1
        from auth.DatasetQueryConstraint
        where DatasetQueryId = dq.Id and
        ConstraintId = 2 and
        ConstraintValue in (select [Group] from @groups)
    )
    or not exists (
        select 1
        from auth.DatasetQueryConstraint
        where DatasetQueryId = dq.Id
    );

    -- produce the hydrated records
    select
        i.Id,
        dq.UniversalId,
        dq.Shape,
        dq.Name,
        dqc.Category,
        dq.[Description],
        dq.SqlStatement
    from @ids i
    join app.DatasetQuery dq on i.Id = dq.Id
    left join app.DatasetQueryCategory dqc on dq.CategoryId = dqc.Id;

    -- produce the tags for each record
    select
        i.Id,
        Tag
    from @ids i
    join app.DatasetQueryTag t on i.Id = t.DatasetQueryId

END






GO
/****** Object:  StoredProcedure [app].[sp_GetDemographicContextById]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/17
-- Description: Retrieves the app.Query.Pepper and app.DemographicQuery by Query.Id
-- =======================================
ALTER PROCEDURE [app].[sp_GetDemographicContextById]
    @queryid UNIQUEIDENTIFIER,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- queryconstraint ok?
    IF (auth.fn_UserIsAuthorizedForQueryById(@user, @groups, @queryid) = 0)
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
        SqlStatement
    FROM app.DemographicQuery
END






GO
/****** Object:  StoredProcedure [app].[sp_GetDemographicContextByUId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/17
-- Description: Retrieves the app.Query.Pepper and app.DemographicQuery by Query.UniversalId
-- =======================================
ALTER PROCEDURE [app].[sp_GetDemographicContextByUId]
    @queryuid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.Query
    WHERE app.Query.UniversalId = @queryuid;

    EXEC app.sp_GetDemographicContextById @qid, @user, @groups;
END





GO
/****** Object:  StoredProcedure [app].[sp_GetDemographicQuery]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/28
-- Description: Retrieves the DemographicQuery record.
-- =======================================
ALTER PROCEDURE [app].[sp_GetDemographicQuery]
AS
BEGIN
    SET NOCOUNT ON

    SELECT TOP 1
        SqlStatement
    FROM app.DemographicQuery
END







GO
/****** Object:  StoredProcedure [app].[sp_GetGeneralEquivalenceMapping]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Nic Dobbins
-- Create date: 2018/9/20
-- Description:	Gets the closest estimated ICD9->10 or ICD10->9 equivalent
-- =============================================
ALTER PROCEDURE [app].[sp_GetGeneralEquivalenceMapping]
	@source nvarchar(50)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT TOP (1) 
		 [TargetCode]
		,[TargetCodeType]
		,[UiDisplayTargetName]
    FROM [app].[GeneralEquivalenceMapping]
    WHERE SourceCode LIKE @source + '%'

END








GO
/****** Object:  StoredProcedure [app].[sp_GetGeometries]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Nic Dobbins
-- Create date: 2018/9/20
-- Description:	Gets zip code GeoJson for choropleth mapping
-- =============================================
ALTER PROCEDURE [app].[sp_GetGeometries]
	@ids app.ListTable READONLY,
	@geoType NVARCHAR(20)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT G.GeometryId
		 , G.GeometryType
		 , G.GeometryJson
	FROM [app].[Geometry] AS G
	WHERE G.GeometryType = @geoType
		  AND EXISTS (SELECT 1 FROM @ids AS ID WHERE G.GeometryId = ID.Id)

END







GO
/****** Object:  StoredProcedure [app].[sp_GetParentConceptsByChildIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins; Ported by Cliff Spital
-- Create date: 2018/6/27
-- Description: Returns parent concept Ids for the given child concept Ids
-- =======================================
ALTER PROCEDURE [app].[sp_GetParentConceptsByChildIds]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @outputLimit int = 20,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    CREATE TABLE #t
    (
        Id [uniqueidentifier] null,
        ParentId [uniqueidentifier] null,
        TreeLevel int null,
        PatientCount int null
    )

    INSERT INTO #t
    SELECT TOP (@outputLimit)
        c.Id,
        c.ParentId,
        TreeLevel = 0,
        c.UiDisplayPatientCount
    FROM app.Concept c 
    WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)
    ORDER BY c.UiDisplayPatientCount DESC

    DECLARE
        @LoopCount int = 0,
        @LoopLimit int = 10,
        @RetrievedRows int = 1;
    
    WHILE @LoopCount < @LoopLimit AND @RetrievedRows > 0
    BEGIN

        INSERT INTO #t (Id, ParentId, TreeLevel)
        SELECT
            c.Id,
            c.ParentId,
            TreeLevel = @LoopCount + 1 --> NOTE CHS why make this a one based index?
        FROM app.Concept c 
        WHERE EXISTS (SELECT 1 FROM #t t WHERE c.Id = t.ParentId AND t.TreeLevel = @LoopCount)

        SET @RetrievedRows = @@ROWCOUNT
        SET @LoopCount += 1

    END

    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT DISTINCT Id
    FROM #t;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END














GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightConceptById]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves a preflight report and concept directly by Id.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightConceptById]
    @id [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceIdTable;

    INSERT INTO @requested
    SELECT @id;

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_InternalConceptPreflightCheck @requested, @user, @groups;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id
    FROM @preflight
    WHERE IsPresent = 1 AND IsAuthorized = 1;

    SELECT Id, UniversalId, IsPresent, IsAuthorized
    FROM @preflight;

    EXEC app.sp_HydrateConceptsByIds @allowed;

END







GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightConceptByUId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves preflight report and concepts requested by universalIds.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightConceptByUId]
    @uid nvarchar(200),
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceUniversalIdTable;

    INSERT INTO @requested
    SELECT @uid;

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_UniversalConceptPreflightCheck @requested, @user, @groups;

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
/****** Object:  StoredProcedure [app].[sp_GetPreflightConceptsByIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves preflight report and concepts by Id.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightConceptsByIds]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_InternalConceptPreflightCheck @ids, @user, @groups;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id
    FROM @preflight
    WHERE IsPresent = 1 AND IsAuthorized = 1;

    SELECT Id, UniversalId, IsPresent, IsAuthorized
    FROM @preflight;
    
    EXEC app.sp_HydrateConceptsByIds @allowed;

END







GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightConceptsByUIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves preflight report and concepts by UIds.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightConceptsByUIds]
    @uids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_UniversalConceptPreflightCheck @uids, @user, @groups;

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
/****** Object:  StoredProcedure [app].[sp_GetPreflightQueriesByIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a query preflight check by Ids.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightQueriesByIds]
    @qids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY    
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

    with queries (QueryId, IsPresent) as (
        select qs.Id, IsPresent = case when aq.Id is not null then cast(1 as bit) else cast(0 as bit) end
        from @qids qs
        left join app.Query aq on qs.Id = aq.Id
        union
        select QueryId, cast(1 as bit)
        from rela.QueryDependency qd
        where exists (select 1 from @qids where Id = QueryId)
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
        select e.QueryId, e.UniversalId, e.Ver, e.IsPresent, auth.fn_UserIsAuthorizedForQueryById(@user, @groups, e.QueryId)
        from enriched e
    ),
    withConcepts (QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId) as (
        select a.*, ConceptId = qc.DependsOn
        from authQ a
        join rela.QueryConceptDependency qc on a.QueryId = qc.QueryId
    )
    insert into @preflight (QueryId, QueryUniversalId, QueryVer, QueryIsPresent, QueryIsAuthorized, ConceptId)
    select QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId
    from withConcepts;

    declare @concIds app.ResourceIdTable;
    insert into @concIds
    select distinct ConceptId
    from @preflight;

    declare @conceptAuths app.ConceptPreflightTable;
    insert @conceptAuths
    exec app.sp_InternalConceptPreflightCheck @concIds, @user, @groups;

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
/****** Object:  StoredProcedure [app].[sp_GetPreflightQueriesByUIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a query preflight check by Ids.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightQueriesByUIds]
    @quids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY    
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
        select e.QueryId, e.UniversalId, e.Ver, e.IsPresent, auth.fn_UserIsAuthorizedForQueryById(@user, @groups, e.QueryId)
        from enriched e
    ),
    withConcepts (QueryId, UniversalId, Ver, IsPresent, IsAuthorized, ConceptId) as (
        select a.*, ConceptId = qc.DependsOn
        from authQ a
        join rela.QueryConceptDependency qc on a.QueryId = qc.QueryId
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
    exec app.sp_InternalConceptPreflightCheck @concIds, @user, @groups;

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
/****** Object:  StoredProcedure [app].[sp_GetPreflightResourcesByIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a preflight resource check by Ids.
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightResourcesByIds]
    @qids app.ResourceIdTable READONLY,
    @cids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    exec app.sp_GetPreflightQueriesByIds @qids, @user, @groups;

    exec app.sp_GetPreflightConceptsByIds @cids, @user, @groups;
END


GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightResourcesByUIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/2/4
-- Description: Performs a preflight resources check by UIds
-- =======================================
ALTER PROCEDURE [app].[sp_GetPreflightResourcesByUIds]
    @quids app.ResourceUniversalIdTable READONLY,
    @cuids app.ResourceUniversalIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    exec app.sp_GetPreflightQueriesByUIds @quids, @user, @groups;

    exec app.sp_GetPreflightConceptsByUIds @cuids, @user, @groups;
END



GO
/****** Object:  StoredProcedure [app].[sp_GetRootConcepts]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/7/10
-- Description: Retrieves all Top Parent concept's
-- =======================================
ALTER PROCEDURE [app].[sp_GetRootConcepts]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceIdTable;

    INSERT INTO @requested
    SELECT Id
    FROM app.Concept
    WHERE IsRoot = 1;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END













GO
/****** Object:  StoredProcedure [app].[sp_GetRootsPanelFilters]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/9/14
-- Description: Gets roots and panel filters, in the first and second result set respecively.
-- =======================================
ALTER PROCEDURE [app].[sp_GetRootsPanelFilters]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    EXEC app.sp_GetRootConcepts @user, @groups, @admin = @admin;

    SELECT
        f.Id,
        f.ConceptId,
        ConceptUniversalId = c.UniversalId,
        f.IsInclusion,
        f.UiDisplayText,
        f.UiDisplayDescription
    FROM
        app.PanelFilter f
    JOIN app.Concept c on f.ConceptId = c.Id
    WHERE c.IsEnabled = 1 and f.IsEnabled = 1;
    
END











GO
/****** Object:  StoredProcedure [app].[sp_GetSavedBaseQueriesByConstraint]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieves all saved query pointers owned by the given user.
-- =======================================
ALTER PROCEDURE [app].[sp_GetSavedBaseQueriesByConstraint]
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON;

    WITH permitted (QueryId) AS (
        -- user based constraint
        SELECT
            QueryId
        FROM auth.QueryConstraint
        WHERE ConstraintId = 1
        AND ConstraintValue = @user
        UNION
        -- group base constraint
        SELECT
            QueryId
        FROM auth.QueryConstraint
        WHERE ConstraintId = 2
        AND ConstraintValue IN (SELECT [Group] FROM @groups)
    )
    SELECT
        q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated,
        [Count] = COUNT(*)
    FROM app.Query q
    JOIN app.Cohort c on q.Id = c.QueryId
    WHERE (q.[Owner] = @user OR q.Id IN (SELECT QueryId FROM permitted))
    AND UniversalId IS NOT NULL
    AND Nonce IS NULL
    GROUP BY q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated;
END










GO
/****** Object:  StoredProcedure [app].[sp_GetSavedBaseQueriesByOwner]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieves all saved query pointers owned by the given user.
-- =======================================
ALTER PROCEDURE [app].[sp_GetSavedBaseQueriesByOwner]
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated,
        [Count] = COUNT(*)
    FROM
        app.Query q
    JOIN app.Cohort c on q.Id = c.QueryId
    WHERE [Owner] = @user
    AND UniversalId IS NOT NULL
    AND Nonce IS NULL
    GROUP BY q.Id,
        q.UniversalId,
        q.[Name],
        q.[Category],
        q.[Owner],
        q.Created,
        q.Updated;
END









GO
/****** Object:  StoredProcedure [app].[sp_GetSavedQueryByUId]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieve a query by UniversalId if owner.
-- =======================================
ALTER PROCEDURE [app].[sp_GetSavedQueryByUId]
    @uid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
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
        [Owner] nvarchar(50) NOT NULL,
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
/****** Object:  StoredProcedure [app].[sp_HydrateConceptsByIds]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital, modified by Nic Dobbins
-- Create date: 2018/8/2
-- Modify date: 2019/1/4 - Added Concept Specializations
-- Description: Hydrates a list of Concept Models by Ids
-- =======================================
ALTER PROCEDURE [app].[sp_HydrateConceptsByIds]
    @ids app.ResourceIdTable READONLY
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @enabled app.ResourceIdTable
	DECLARE @specializedGroups app.ListTable

	-- Get enabled concepts only
	INSERT INTO @enabled (Id)
	SELECT c.Id
	FROM app.Concept c
	WHERE c.IsEnabled = 1
		  AND EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)

	-- Get specialization groups for
	-- the concepts to be retrieved
	INSERT INTO @specializedGroups (Id)
	SELECT sg.Id
	FROM app.SpecializationGroup sg
	WHERE EXISTS (SELECT 1 
				  FROM rela.ConceptSpecializationGroup csg
					   INNER JOIN app.Concept c
							ON csg.ConceptId = c.Id
				  WHERE EXISTS (SELECT 1 FROM @enabled i WHERE i.Id = c.Id)
						AND c.SqlSetId = sg.SqlSetId
						AND c.IsSpecializable = 1)

	-- Return concepts
    SELECT
        c.Id,
        c.ParentId,
        c.RootId,
        c.ExternalId,
        c.ExternalParentId,
        c.UniversalId,
        c.IsNumeric,
        s.IsEventBased,
        c.IsParent,
        s.IsEncounterBased,
        c.IsPatientCountAutoCalculated,
        c.IsSpecializable,
        s.SqlSetFrom,
        c.SqlSetWhere,
        s.SqlFieldDate,
        c.SqlFieldNumeric,
        s.SqlFieldEventId,
        c.UiDisplayName,
        c.UiDisplayText,
		c.UiDisplaySubtext,
        c.UiDisplayUnits,
        c.UiDisplayTooltip,
        c.UiDisplayPatientCount,
        c.UiDisplayPatientCountByYear,
        c.UiNumericDefaultText
    FROM app.Concept c
		 INNER JOIN app.ConceptSqlSet s
			ON c.SqlSetId = s.Id
    WHERE EXISTS (SELECT 1 FROM @enabled i WHERE c.Id = i.Id)
    ORDER BY c.UiDisplayRowOrder, c.UiDisplayName

	-- Return Specialization groups
	-- with ConceptId context
	SELECT csg.ConceptId
		 , sg.Id
		 , sg.UiDefaultText
		 , csg.OrderId
	FROM rela.ConceptSpecializationGroup csg
		 INNER JOIN app.SpecializationGroup sg
			ON csg.SpecializationGroupId = sg.Id
	WHERE EXISTS (SELECT 1 FROM @enabled i WHERE i.Id = csg.ConceptId)
		  AND EXISTS (SELECT 1 FROM @specializedGroups sg WHERE sg.Id = sg.Id)

	-- Return Specializations
	SELECT s.Id
		 , s.SpecializationGroupId	
		 , s.UniversalId
		 , s.UiDisplayText
		 , s.SqlSetWhere
		 , s.OrderId
	FROM app.Specialization s
	WHERE EXISTS (SELECT 1 FROM @specializedGroups sg WHERE sg.Id = s.SpecializationGroupId)

END







GO
/****** Object:  StoredProcedure [app].[sp_InternalConceptPreflightCheck]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/23
-- Description: Preflight checks institutionally referenced conceptIds.
-- Required Checks: Is concept present? Is the user authorized to execute?
-- =======================================
ALTER PROCEDURE [app].[sp_InternalConceptPreflightCheck]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @results app.ConceptPreflightTable;

    INSERT INTO @results (Id, IsPresent, IsAuthorized)
    SELECT Id, 0, 0 -- initialize bools to false
    FROM @ids;

    -- identify which ids are present
    WITH present as (
        SELECT Id, UniversalId
        FROM app.Concept c
        WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)
    )
    UPDATE @results
    SET
        UniversalId = p.UniversalId,
        IsPresent = 1
    FROM @results r
    JOIN present p on r.Id = p.Id

    -- identify which ids are authorized
    -- dont bother checking missing concepts
    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT Id
    FROM @results
    WHERE IsPresent = 1;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id FROM app.fn_FilterConceptsByConstraint(@user, @groups, @requested);

    UPDATE @results
    SET
        IsAuthorized = 1
    FROM @results r
    WHERE EXISTS (SELECT 1 FROM @allowed a WHERE r.Id = a.Id)

    SELECT
        Id,
        UniversalId,
        IsPresent,
        IsAuthorized
    FROM @results;



END








GO
/****** Object:  StoredProcedure [app].[sp_InternalQuerySaveInitial]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Contains core logic for initial save functionality.
-- =======================================
ALTER PROCEDURE [app].[sp_InternalQuerySaveInitial]
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
/****** Object:  StoredProcedure [app].[sp_InternalQuerySaveUpdateMove]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Performs a resave of an existing query.
-- =======================================
ALTER PROCEDURE [app].[sp_InternalQuerySaveUpdateMove]
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

    -- move constraints from oldqueryid that isn't user & owner record
    INSERT INTO auth.QueryConstraint
    SELECT @queryid, ConstraintId, ConstraintValue
    FROM auth.QueryConstraint
    WHERE QueryId = @oldqueryid and ConstraintId != 1 and ConstraintValue != @user;

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
/****** Object:  StoredProcedure [app].[sp_QuerySaveInitial]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Performs the initial homerun query save.
-- =======================================
ALTER PROCEDURE [app].[sp_QuerySaveInitial]
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- ensure saving user is the owner of the query
    DECLARE @owner NVARCHAR(200), @qid UNIQUEIDENTIFIER;

    SELECT @qid = Id, @owner = [Owner]
    FROM app.Query
    WHERE Id = @queryid;

    IF (@qid IS NULL)
    BEGIN;
        SELECT UniversalId = NULL, Ver = NULL WHERE 1 = 0;
        RETURN;
    END;
    
    IF (@owner != @user)
    BEGIN;
        DECLARE @403msg NVARCHAR(400) = N'Query ' + cast(@queryid as nvarchar(50)) + N' is not owned by ' + @user;
        THROW 70403, @403msg, 1;
    END;

    -- if so begin transaction and continue
    BEGIN TRAN;

    BEGIN TRY

        EXEC app.sp_InternalQuerySaveInitial @queryid, @urn, 1, @name, @category, @conceptids, @queryids, @definition, @user;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
    
    SELECT UniversalId, Ver
    FROM app.Query
    WHERE Id = @queryid
END









GO
/****** Object:  StoredProcedure [app].[sp_QuerySaveUpsert]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/1/9
-- Description: Performs a query upsert save.
-- =======================================
ALTER PROCEDURE [app].[sp_QuerySaveUpsert]
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

    -- ensure saving user is the owner of the query
    DECLARE @owner NVARCHAR(200), @qid UNIQUEIDENTIFIER;

    SELECT @qid = Id, @owner = [Owner]
    FROM app.Query
    WHERE Id = @queryid;

    IF (@qid IS NULL)
    BEGIN;
        SELECT UniversalId = NULL, Ver = NULL WHERE 1 = 0;
        RETURN;
    END;
    
    IF (@owner != @user)
    BEGIN;
        DECLARE @new403msg NVARCHAR(400) = N'Query ' + cast(@queryid as nvarchar(50)) + N' is not owned by ' + @user;
        THROW 70403, @new403msg, 1;
    END;

    -- determine if urn exists already
    DECLARE @oldowner NVARCHAR(200), @oldqid UNIQUEIDENTIFIER, @oldver int;

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
            IF (@oldowner != @user)
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
                -- delegate to resave sproc
                EXEC app.sp_InternalQuerySaveUpdateMove @oldqid, @queryid, @urn, @ver, @name, @category, @conceptids, @queryids, @definition, @user;
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
/****** Object:  StoredProcedure [app].[sp_UniversalConceptPreflightCheck]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
    @groups auth.GroupMembership READONLY
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
    SELECT Id FROM app.fn_FilterConceptsByConstraint(@user, @groups, @requested);

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
/****** Object:  StoredProcedure [app].[sp_UpdateDemographicQuery]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/28
-- Description: Updates the SqlStatement for the DemographicQuery record.
-- =======================================
ALTER PROCEDURE [app].[sp_UpdateDemographicQuery]
    @sql app.DatasetQuerySqlStatement,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    UPDATE app.DemographicQuery
    SET
        SqlStatement = @sql,
        LastChanged = GETDATE(),
        ChangedBy = @user
    OUTPUT
        inserted.SqlStatement,
        inserted.LastChanged,
        inserted.ChangedBy;
END










GO
/****** Object:  StoredProcedure [app].[sp_UpdateSearchIndexTables]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/3/23
-- Description: Updates search index tables by diff'ing
--				rather than full truncate/insert, and updates
--              the ConceptTokenizedIndex table.
-- =======================================
ALTER PROCEDURE [app].[sp_UpdateSearchIndexTables]
AS
BEGIN
    SET NOCOUNT ON

	/*
	 * Find concepts where the content update
	 * time is greater than the last
	 * search token update time, or they've never been tokenized.
	 */
	DECLARE @ids app.ResourceIdTable
	INSERT INTO @ids
	SELECT C.Id
	FROM app.Concept C
	WHERE NOT EXISTS (SELECT 1 
					  FROM app.ConceptTokenizedIndex TI 
					  WHERE C.Id = TI.ConceptId 
						    AND TI.Updated > C.ContentLastUpdateDateTime)

	/*
	 * Insert concepts of interest for evaluation.
	 */
	CREATE TABLE #concepts (Id [uniqueidentifier] NULL, rootId [uniqueidentifier] NULL, uiDisplayName NVARCHAR(400) NULL)
	INSERT INTO #concepts
	SELECT Id
		  ,rootID
		  ,LEFT(UiDisplayName,400)
	FROM app.Concept C
	WHERE EXISTS (SELECT 1 FROM @ids ID WHERE C.Id = ID.Id)

	/*
	 * Remove puncuation and non-alphabetic characters.
	 */
	UPDATE #concepts
	SET uiDisplayName = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
						uiDisplayName,',',' '),':',' '),';',' '),'''',' '),'"',' '),']',' '),'[',' '),'(',' '),')',' '),'?',' '),'/',' '),'\',' '),'-',' ')

	/*
	 * Loop through each word in the uiDisplayName and separate each into its own row.
	 */
	DECLARE @loopCount INT = 0,
			@delimeter NVARCHAR(2) = ' ',
			@loopLimit INT = 30,
			@updatedRows INT = 1;

	CREATE TABLE #words
	(
		Word NVARCHAR(400) NULL,
		Id [uniqueidentifier] NULL,
		rootId [uniqueidentifier] NULL
	)

	WHILE @loopCount < @loopLimit AND @updatedRows > 0
	BEGIN

		BEGIN TRY DROP TABLE #currentWords END TRY BEGIN CATCH END CATCH

		/* 
		 * Get the current left-most word (i.e. everything up to the first space " ").
		 */
		INSERT INTO #words
		SELECT Word = CASE CHARINDEX(@delimeter, uiDisplayName) 
						   WHEN 0 THEN LEFT(LTRIM(RTRIM(uiDisplayName)),400)
						   ELSE LEFT(LTRIM(RTRIM(LEFT(uiDisplayName, CHARINDEX(@delimeter, uiDisplayName)))),400) 
					  END
			  ,Id = c.Id
			  ,rootId = c.rootId
		FROM #concepts c

		/* 
		 * Update row count.
		 */
		SET @updatedRows = @@ROWCOUNT

		/* 
		 * NULL out rows with no more spaces (their last word has already been inserted into the #words table).
		 */
		UPDATE #concepts
		SET uiDisplayName = NULL
		WHERE CHARINDEX(@delimeter, uiDisplayName) = 0
			  OR LEN(uiDisplayName) - CHARINDEX(@delimeter, uiDisplayName) < 0

		/* 
		 * Chop off everything to the left of the first space " ".
		 */
		UPDATE #concepts
		SET uiDisplayName = NULLIF(LTRIM(RTRIM(RIGHT(uiDisplayName, LEN(uiDisplayName) - CHARINDEX(@delimeter, uiDisplayName) + 1))),'')
		WHERE uiDisplayName IS NOT NULL 
		  
		/*
		 * DELETE from table if no text left to process.
		 */
		DELETE FROM #concepts
		WHERE NULLIF(uiDisplayName,'') IS NULL

		/*
		 * Increment the @loopCount.
		 */ 
		SET @loopCount += 1

	END

	/*
	 * Index the output and remove any remaining whitespace.
	 */
	CREATE NONCLUSTERED INDEX IDX_WORD ON #words (Word ASC, Id ASC) INCLUDE (RootId)

	UPDATE #words
	SET Word = LOWER(LTRIM(RTRIM(REPLACE(Word, ' ',''))))

	DELETE FROM #words
	WHERE Word IN ('a','-','--','')

	/*
	 * Clear old data.
	 */
	DELETE app.ConceptForwardIndex
	FROM app.ConceptForwardIndex FI
	WHERE EXISTS (SELECT 1 FROM @ids ID WHERE FI.ConceptId = ID.Id)

	DELETE app.ConceptTokenizedIndex
	FROM app.ConceptTokenizedIndex TI
	WHERE NOT EXISTS (SELECT 1 FROM app.Concept C WHERE TI.ConceptId = C.Id)

	/*
	 * Set the last update time on included Concepts
	 * that were picked up here to make sure they
	 * aren't unnecessarily rerun next time due to 
	 * a NULL last update time.
	 */
	UPDATE app.Concept
	SET ContentLastUpdateDateTime = GETDATE()
	FROM app.Concept C
	WHERE EXISTS (SELECT 1 FROM @ids ID WHERE C.Id = ID.Id)
		  AND C.ContentLastUpdateDateTime IS NULL

	/*
	 * Add any words that didn't exist before.
	 */
	INSERT INTO app.ConceptInvertedIndex (Word)
	SELECT DISTINCT Word
	FROM #words W
	WHERE NOT EXISTS (SELECT 1 FROM app.ConceptInvertedIndex II WHERE W.Word = II.Word)

	/*
	 * Update forward index.
	 */
	INSERT INTO app.ConceptForwardIndex (WordId, Word, ConceptId, rootId)
	SELECT II.WordId, W.Word, W.Id, W.RootId
	FROM (SELECT DISTINCT Word, Id, RootId 
		  FROM #words) W
		  INNER JOIN app.ConceptInvertedIndex II
			ON W.Word = II.Word

	/*
	 * Create JSON string array of all tokens
	 * for a given Concept.
	 */
	SELECT ID.Id
		 , STUFF(
		 		 (SELECT '"' + W.Word + '",'
		 		  FROM #words W
		 		  WHERE W.Id = ID.Id
		 		  FOR XML PATH(''))
		  ,1,0,'') AS Tokens
	INTO #jsonTokens
	FROM @ids ID

	UPDATE #jsonTokens
	SET Tokens = '[' + LEFT(Tokens, LEN(Tokens) - 1) + ']'

	/* 
	 * Merge into tokenized index.
	 */
	MERGE INTO app.ConceptTokenizedIndex AS tgt
	USING #jsonTokens as src
		ON tgt.ConceptId = src.Id
	WHEN MATCHED THEN
		UPDATE SET JsonTokens = Tokens
		         , Updated = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (ConceptId, JsonTokens, Updated)
		VALUES (src.Id, src.Tokens, GETDATE());

	/* 
	 * Update word counts.
	 */
	; WITH wordCountCte AS
	(
		SELECT II.WordId, WordCount = COUNT(*)
		FROM app.ConceptInvertedIndex II
			 INNER JOIN app.ConceptForwardIndex FI
				ON II.WordId = FI.WordId
		GROUP BY II.WordId
	)

	UPDATE app.ConceptInvertedIndex
	SET WordCount = CTE.WordCount
	FROM app.ConceptInvertedIndex II
		 INNER JOIN wordCountCte CTE
			ON II.WordId = CTE.WordId

	/* 
	 * Cleanup temp tables.
	 */
	DROP TABLE #concepts
	DROP TABLE #words
	DROP TABLE #jsonTokens

END


GO
/****** Object:  StoredProcedure [auth].[sp_BlacklistToken]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/9/27
-- Description: Blacklists a token
-- =======================================
ALTER PROCEDURE [auth].[sp_BlacklistToken]
    @idNonce UNIQUEIDENTIFIER,
    @exp datetime
AS
BEGIN
    SET NOCOUNT ON

    INSERT INTO auth.TokenBlacklist
    VALUES (@idNonce, @exp);
END






GO
/****** Object:  StoredProcedure [auth].[sp_CreateLogin]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/11
-- Description:	Register a new user with username and pass.
-- =============================================
ALTER PROCEDURE [auth].[sp_CreateLogin]
	@username nvarchar(50),
	@salt varbinary(16),
	@hash varbinary(8000)
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO auth.Login (Username, Salt, Hash)
	OUTPUT inserted.Id
	SELECT @username, @salt, @hash;
END







GO
/****** Object:  StoredProcedure [auth].[sp_GetLoginByUsername]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/8
-- Description:	Retrieves an auth.Login by username.
-- =============================================
ALTER PROCEDURE [auth].[sp_GetLoginByUsername]
	@username nvarchar(50)
AS
BEGIN
	SET NOCOUNT ON;

    SELECT
		Id,
		Username,
		Salt,
		Hash
	FROM
		auth.Login
	WHERE
		Username = @username;
END







GO
/****** Object:  StoredProcedure [auth].[sp_RefreshTokenBlacklist]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/9/27
-- Description: Clears expired tokens, and returns remainder.
-- =======================================
ALTER PROCEDURE [auth].[sp_RefreshTokenBlacklist]
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM auth.TokenBlacklist
    WHERE Expires < GETDATE();

    SELECT IdNonce, Expires
    FROM auth.TokenBlacklist;
END






GO
/****** Object:  StoredProcedure [network].[sp_CreateEndpoint]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Creates a new network.Endpoint record.
-- =============================================
ALTER PROCEDURE [network].[sp_CreateEndpoint]
	@name nvarchar(200),
	@address nvarchar(1000),
	@issuer nvarchar(200),
	@keyid nvarchar(200),
	@certificate nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;

    INSERT INTO network.Endpoint
	(
		Name,
		Address,
		Issuer,
		KeyId,
		Certificate
	)
	OUTPUT inserted.Id
	SELECT
		@name,
		@address,
		@issuer,
		@keyid,
		@certificate 
END










GO
/****** Object:  StoredProcedure [network].[sp_DeleteEndpointById]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Deletes a network.Endpoint record by Id.
-- =============================================
ALTER PROCEDURE [network].[sp_DeleteEndpointById]
	@id int
AS
BEGIN
	SET NOCOUNT ON;

    DELETE FROM network.Endpoint
	WHERE Id = @id;
END









GO
/****** Object:  StoredProcedure [network].[sp_GetEndpoints]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Gets all network.Endpoint records.
-- =============================================
ALTER PROCEDURE [network].[sp_GetEndpoints]
AS
BEGIN
	SET NOCOUNT ON;

    SELECT
		Id,
		Name,
		Address,
		Issuer,
		KeyId,
		Certificate
	FROM
		network.Endpoint;
END









GO
/****** Object:  StoredProcedure [network].[sp_GetIdentity]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/11
-- Description: Returns the network.Identity
-- =======================================
ALTER PROCEDURE [network].[sp_GetIdentity]
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        [Name],
        Abbreviation,
        [Description],
        TotalPatients,
        Latitude,
        Longitude,
        PrimaryColor,
        SecondaryColor
    FROM network.[Identity];
END






GO
/****** Object:  StoredProcedure [network].[sp_GetIdentityEndpoints]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/11
-- Description: Returns the network.Identity and the network.Endpoint
-- =======================================
ALTER PROCEDURE [network].[sp_GetIdentityEndpoints]
AS
BEGIN
    SET NOCOUNT ON

    EXEC network.sp_GetIdentity;

    EXEC network.sp_GetEndpoints;
END







GO
/****** Object:  StoredProcedure [network].[sp_UpdateEndpoint]    Script Date: 3/29/19 11:06:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Update the given network.Endpoint
-- =============================================
ALTER PROCEDURE [network].[sp_UpdateEndpoint]
	@id int,
	@name nvarchar(200),
	@address nvarchar(1000),
	@issuer nvarchar(200),
	@keyid nvarchar(200),
	@certificate nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;

    UPDATE network.Endpoint
	SET
		Name = @name,
		Address = @address,
		Issuer = @issuer,
		KeyId = @keyid,
		Certificate = @certificate,
        Updated = getdate()
    OUTPUT
        deleted.Id,
        deleted.Name,
        deleted.Address,
        deleted.Issuer,
        deleted.KeyId,
        deleted.Certificate
	WHERE
		Id = @id;
END

