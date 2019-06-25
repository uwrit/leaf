-- Add ref.Version Table.
IF OBJECT_ID('ref.Version') IS NOT NULL
	DROP TABLE [ref].[Version]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [ref].[Version](
	[Lock] [char](1) NOT NULL,
	[Version] [nvarchar](100) NOT NULL
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
ALTER TABLE [ref].[Version] ADD  CONSTRAINT [PK_Version] PRIMARY KEY CLUSTERED 
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [ref].[Version] ADD  CONSTRAINT [DF_Version_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [ref].[Version]  WITH CHECK ADD  CONSTRAINT [CK_Version_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [ref].[Version] CHECK CONSTRAINT [CK_Version_1]
GO


-- Create Null or Whitespace string check
IF OBJECT_ID('app.fn_NullOrWhitespace') IS NOT NULL
    DROP FUNCTION [app].[fn_NullOrWhitespace];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Returns 1 if string is null or consists of only whitespace, else 0.
-- =======================================
CREATE FUNCTION app.fn_NullOrWhitespace
(
    @s nvarchar(max)
)
RETURNS bit
AS
BEGIN
    IF (ISNULL(@s, N'') = N'')
        RETURN 1;

    RETURN 0;
END
GO

-- Update DatasetQueryCategory table.
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'FK_DatasetQuery_CategoryId' and [type] = 'F')
    ALTER TABLE [app].[DatasetQuery] DROP CONSTRAINT FK_DatasetQuery_CategoryId
GO

-- Copy any existing rows
BEGIN TRY DROP TABLE #DatasetQueryCategory END TRY BEGIN CATCH END CATCH
CREATE TABLE #DatasetQueryCategory ([Id] [int] NOT NULL, [Category] [nvarchar](200) NOT NULL, [Created] [datetime] NOT NULL)
INSERT INTO #DatasetQueryCategory
SELECT Id, Category, Created
FROM app.DatasetQueryCategory

IF OBJECT_ID('app.DatasetQueryCategory') IS NOT NULL
    DROP TABLE [app].[DatasetQueryCategory]
GO
CREATE TABLE [app].[DatasetQueryCategory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Category] [nvarchar](200) NOT NULL,
	[Created] [datetime] NOT NULL,
    [CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL
) ON [PRIMARY]
GO

SET IDENTITY_INSERT app.DatasetQueryCategory ON
INSERT INTO app.DatasetQueryCategory (Id, Category, Created, CreatedBy, Updated, UpdatedBy)
SELECT Id, Category, Created, '', GETDATE(), ''
FROM #DatasetQueryCategory
SET IDENTITY_INSERT app.DatasetQueryCategory OFF


ALTER TABLE [app].[DatasetQueryCategory] ADD PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_DatasetQueryCategory_Category] ON [app].[DatasetQueryCategory]
(
	[Category] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[DatasetQueryCategory] ADD  CONSTRAINT [DF_DatasetQueryCategory_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[DatasetQuery]  WITH CHECK ADD CONSTRAINT [FK_DatasetQuery_CategoryId] FOREIGN KEY([CategoryId])
REFERENCES [app].[DatasetQueryCategory] ([Id])
GO
ALTER TABLE [app].[DatasetQuery] CHECK CONSTRAINT [FK_DatasetQuery_CategoryId]
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IXUniq_DatasetQuery_UniversalId')
	DROP INDEX [IXUniq_DatasetQuery_UniversalId] ON [app].[DatasetQuery]
GO
CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_DatasetQuery_UniversalId] ON [app].[DatasetQuery]
(
	[UniversalId] ASC
)
WHERE ([UniversalId] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

-- Update network sprocs.
IF OBJECT_ID('network.sp_UpdateEndpoint', 'P') IS NOT NULL
	DROP PROCEDURE [network].[sp_UpdateEndpoint]
GO

IF OBJECT_ID('adm.sp_UpdateEndpoint', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateEndpoint];
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2019/5/28
-- Description:	Update the given network.Endpoint
-- =============================================
CREATE PROCEDURE [adm].[sp_UpdateEndpoint]
	@id int,
	@name nvarchar(200),
	@addr nvarchar(1000),
	@iss nvarchar(200),
	@kid nvarchar(200),
	@cert nvarchar(max),
    @isResponder bit,
    @isInterrogator bit,
    @user auth.[User]
AS
BEGIN
	SET NOCOUNT ON;

    IF (@id IS NULL)
		THROW 70400, N'NetworkEndpoint.Id is required.', 1;

	IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'NetworkEndpoint.Name is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@addr) = 1)
        THROW 70400, N'NetworkEndpoint.Address is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@iss) = 1)
        THROW 70400, N'NetworkEndpoint.Issuer is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@kid) = 1)
        THROW 70400, N'NetworkEndpoint.KeyId is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@cert) = 1)
        THROW 70400, N'NetworkEndpoint.Certificate is required.', 1;
    
    IF (@isInterrogator IS NULL)
        THROW 70400, N'NetworkEndpoint.IsInterrogator is required.', 1;

    IF (@isResponder IS NULL)
        THROW 70400, N'NetworkEndpoint.IsResponder is required.', 1;

    BEGIN TRAN;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM network.Endpoint WHERE Id = @id)
			THROW 70404, N'NetworkEndpoint not found.', 1;

        IF EXISTS (SELECT 1 FROM network.Endpoint WHERE Id != @id AND (Name = @name OR KeyId = @kid OR Issuer = @iss))
            THROW 70409, N'NetworkEndpoint already exists with that name, key id, or issuer value.', 1;

        UPDATE network.Endpoint
        SET
            Name = @name,
            Address = @addr,
            Issuer = @iss,
            KeyId = @kid,
            Certificate = @cert,
            IsResponder = @isResponder,
            IsInterrogator = @isInterrogator,
            Updated = GETDATE()
        OUTPUT
            inserted.Id,
            inserted.Name,
            inserted.Address,
            inserted.Issuer,
            inserted.KeyId,
            inserted.Certificate,
            inserted.IsResponder,
            inserted.IsInterrogator,
            inserted.Updated,
            inserted.Created
        WHERE
            Id = @id;
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO


IF OBJECT_ID('adm.sp_UpsertIdentity', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpsertIdentity];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/5/23
-- Description: Inserts or updates network.Identity.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpsertIdentity]
    @name nvarchar(300),
    @abbr nvarchar(20),
    @desc nvarchar(4000),
    @totalPatients int,
    @lat DECIMAL(7,4),
    @lng DECIMAL(7,4),
    @primColor nvarchar(40),
    @secColor nvarchar(40),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'NetworkIdentity.Name is required.', 1;

    BEGIN TRAN;

    IF EXISTS (SELECT Lock FROM network.[Identity])
    BEGIN;
        UPDATE network.[Identity]
        SET
            [Name] = @name,
            Abbreviation = @abbr,
            [Description] = @desc,
            TotalPatients = @totalPatients,
            Latitude = @lat,
            Longitude = @lng,
            PrimaryColor = @primColor,
            SecondaryColor = @secColor
        OUTPUT
            inserted.Name,
            inserted.Abbreviation,
            inserted.[Description],
            inserted.TotalPatients,
            inserted.Latitude,
            inserted.Longitude,
            inserted.PrimaryColor,
            inserted.SecondaryColor;
    END;
    ELSE
    BEGIN;
        INSERT INTO network.[Identity] ([Name], Abbreviation, [Description], TotalPatients, Latitude, Longitude, PrimaryColor, SecondaryColor)
        OUTPUT inserted.Name, inserted.Abbreviation, inserted.[Description], inserted.TotalPatients, inserted.Latitude, inserted.Longitude, inserted.PrimaryColor, inserted.SecondaryColor
        VALUES (@name, @abbr, @desc, @totalPatients, @lat, @lng, @primColor, @secColor);
    END;

    COMMIT;
END
GO


IF OBJECT_ID('adm.sp_CreateEndpoint', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateEndpoint];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/5/23
-- Description: Creates a new network.Endpoint
-- =======================================
CREATE PROCEDURE adm.sp_CreateEndpoint
    @name nvarchar(200),
    @addr nvarchar(1000),
    @iss nvarchar(200),
    @kid nvarchar(200),
    @cert nvarchar(max),
    @isInterrogator bit,
    @isResponder bit,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'NetworkEndpoint.Name is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@addr) = 1)
        THROW 70400, N'NetworkEndpoint.Address is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@iss) = 1)
        THROW 70400, N'NetworkEndpoint.Issuer is required.', 1;

    IF (app.fn_NullOrWhitespace(@kid) = 1)
        THROW 70400, N'NetworkEndpoint.KeyId is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@cert) = 1)
        THROW 70400, N'NetworkEndpoint.Certificate is required.', 1;
    
    IF (@isInterrogator IS NULL)
        THROW 70400, N'NetworkEndpoint.IsInterrogator is required.', 1;

    IF (@isResponder IS NULL)
        THROW 70400, N'NetworkEndpoint.IsResponder is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM network.Endpoint WHERE Name = @name OR KeyId = @kid OR Issuer = @iss)
            THROW 70409, N'NetworkEndpoint already exists with that name, key id, or issuer value.', 1;

        INSERT INTO network.Endpoint ([Name], [Address], Issuer, KeyId, [Certificate], Created, Updated, IsInterrogator, IsResponder)
        OUTPUT inserted.Id, inserted.Name, inserted.Address, inserted.Issuer, inserted.KeyId, inserted.Certificate, inserted.Created, inserted.Updated, inserted.IsInterrogator, inserted.IsResponder
        VALUES (@name, @addr, @iss, @kid, @cert, getdate(), getdate(), @isInterrogator, @isResponder);
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO


IF OBJECT_ID('adm.sp_DeleteEndpoint', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_DeleteEndpoint];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/5/23
-- Description: Deletes a new network.Endpoint
-- =======================================
CREATE PROCEDURE adm.sp_DeleteEndpoint
    @id int,
	@user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM network.Endpoint
    OUTPUT deleted.Id, deleted.Name, deleted.Address, deleted.Issuer, deleted.KeyId, deleted.Certificate, deleted.Created, deleted.Updated, deleted.IsInterrogator, deleted.IsResponder
    WHERE Id = @id;

END
GO


-- Create maintenance stored procedures.
IF OBJECT_ID('app.sp_CalculateConceptPatientCount', 'P') IS NOT NULL
        DROP PROCEDURE [app].[sp_CalculateConceptPatientCount]
GO
CREATE PROCEDURE [app].[sp_CalculateConceptPatientCount]
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
									  (SELECT PatientYear = CONVERT(NVARCHAR(10),YEAR(' + @Date + '))
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


IF OBJECT_ID('app.sp_CalculatePatientCounts', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_CalculatePatientCounts];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/5/23
-- Description: Loops through Concepts and auto-calculates patient counts.
-- =======================================
CREATE PROCEDURE [app].[sp_CalculatePatientCounts]

@PersonIdField NVARCHAR(50),
@TargetDataBaseName NVARCHAR(50),
@TotalAllowedRuntimeInMinutes INT,
@PerRootConceptAllowedRuntimeInMinutes INT,
@SpecificRootConcept UNIQUEIDENTIFIER = NULL

AS
BEGIN

	SELECT Id
		 , RowNumber = DENSE_RANK() OVER(ORDER BY Id)
	INTO #Roots
	FROM app.Concept
	WHERE IsRoot = 1
		  AND (Id = @SpecificRootConcept OR @SpecificRootConcept IS NULL)

	DECLARE @TotalRoots INT = (SELECT MAX(RowNumber) FROM #roots),
			@CurrentRoot INT = 1,
			@CurrentRootId UNIQUEIDENTIFIER,
			@TotalConcepts INT,
			@CurrentConcept INT = 1,
			@CurrentConceptId UNIQUEIDENTIFIER,
			@From NVARCHAR(MAX),
			@Where NVARCHAR(MAX),
			@Date NVARCHAR(200),
			@isEncounterBased BIT,
			@SetMarker NVARCHAR(5) = '@',
			@SetAlias NVARCHAR(5) = '_T',
			@TimeLimit DATETIME = DATEADD(MINUTE,@TotalAllowedRuntimeInMinutes,GETDATE()),
			@TimeLimitPerRootConcept DATETIME = DATEADD(MINUTE,@PerRootConceptAllowedRuntimeInMinutes,GETDATE()),
			@PerRootConceptRowLimit INT = 50000,
			@CurrentDateTime DATETIME = GETDATE()
	

	------------------------------------------------------------------------------------------------------------------------------ 
	-- ForEach root concept
	------------------------------------------------------------------------------------------------------------------------------
	WHILE @CurrentRoot <= @TotalRoots AND @CurrentDateTime < @TimeLimit

	BEGIN
		
		SET @CurrentRootId = (SELECT Id FROM #roots WHERE RowNumber = @CurrentRoot)

		BEGIN TRY DROP TABLE #Concepts END TRY BEGIN CATCH END CATCH

		-- Find all children concepts under current root concept
		SELECT TOP (@PerRootConceptRowLimit)
			   c.Id
			 , SqlSetFrom = REPLACE(s.SqlSetFrom,@SetMarker,@SetAlias)
			 , SqlSetWhere = REPLACE(c.SqlSetWhere,@SetMarker,@SetAlias)
			 , SqlFieldDate = REPLACE(s.SqlFieldDate,@SetMarker,@SetAlias)
			 , isEncounterBased
			 , RowNumber = DENSE_RANK() OVER(ORDER BY PatientCountLastUpdateDateTime,c.Id)
		INTO #Concepts
		FROM app.Concept AS c
			 LEFT JOIN app.ConceptSqlSet AS s
				ON c.SqlSetId = s.Id
		WHERE c.RootId = @CurrentRootId
			  AND c.IsPatientCountAutoCalculated = 1
		ORDER BY PatientCountLastUpdateDateTime ASC

		SET @TotalConcepts = @@ROWCOUNT

		------------------------------------------------------------------------------------------------------------------------------
		-- ForEach concept in concepts
		------------------------------------------------------------------------------------------------------------------------------
		WHILE @CurrentConcept <= @TotalConcepts AND @CurrentDateTime < @TimeLimit AND @CurrentDateTime < @TimeLimitPerRootConcept

		BEGIN 

			SELECT @From = C.SqlSetFrom
				 , @Where = C.SqlSetWhere
				 , @Date = C.SqlFieldDate
				 , @isEncounterBased = C.isEncounterBased
				 , @CurrentConceptId = Id
			FROM #Concepts C
			WHERE RowNumber = @CurrentConcept

			BEGIN TRY 
			
				-- Calculate patient counts for this concept
				EXECUTE app.sp_CalculateConceptPatientCount
					@PersonIdField,
					@TargetDatabaseName,
					@From,
					@Where,
					@Date,
					@isEncounterBased,
					@CurrentRootId,
					@CurrentConceptId

			END TRY BEGIN CATCH END CATCH

			-- Increment the @CurrentConcept parameter
			SET @CurrentConcept = @CurrentConcept + 1
			SET @CurrentDateTime = GETDATE()

		END 
		-- End ForEach concept

		SET @CurrentRoot = @CurrentRoot + 1
		SET @TimeLimitPerRootConcept = DATEADD(MINUTE,@PerRootConceptAllowedRuntimeInMinutes,GETDATE())

	END 
	-- End ForEach root concept


END
GO


-- Drop any stored procedures that require ResourceConstraintTable (they'll be 
-- added back in below).
IF OBJECT_ID('adm.sp_CreateConcept', 'P') IS NOT NULL
	DROP PROCEDURE [adm].[sp_CreateConcept]
GO
IF OBJECT_ID('adm.sp_UpdateConcept', 'P') IS NOT NULL
	DROP PROCEDURE [adm].[sp_UpdateConcept]
GO
IF OBJECT_ID('adm.sp_CreateDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_CreateDatasetQuery]
GO
IF OBJECT_ID('adm.sp_UpdateDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_UpdateDatasetQuery]
GO

-- Create generic ResourceConstraintTable
IF TYPE_ID('[auth].[ResourceConstraintTable]') IS NOT NULL
	DROP TYPE [auth].[ResourceConstraintTable];
GO
CREATE TYPE [auth].[ResourceConstraintTable] AS TABLE
(
    ResourceId uniqueidentifier not null,
    ConstraintId int not null,
    ConstraintValue nvarchar(1000) not null
)
GO


-- Cut Concept over to generic constraint table
IF OBJECT_ID('adm.sp_CreateConcept', 'P') IS NOT NULL
	DROP PROCEDURE [adm].[sp_CreateConcept]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/29
-- Description: Creates an app.Concept along with auth.ConceptConstraint and rela.ConceptSpecializationGroup.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateConcept]
    @universalId nvarchar(200),
    @parentId uniqueidentifier,
    @rootId uniqueidentifier,
    @externalId nvarchar(200),
    @externalParentId nvarchar(200),
    @isPatientCountAutoCalculated bit,
    @isNumeric bit,
    @isParent bit,
    @isRoot bit,
    @isSpecializable bit,
    @sqlSetId int,
    @sqlSetWhere nvarchar(1000),
    @sqlFieldNumeric nvarchar(1000),
    @uiDisplayName nvarchar(400),
    @uiDisplayText nvarchar(1000),
    @uiDisplaySubtext nvarchar(100),
	@uiDisplayUnits nvarchar(50),
	@uiDisplayTooltip nvarchar(max),
	@uiDisplayPatientCount int,
	@uiNumericDefaultText nvarchar(50),
    @constraints auth.ResourceConstraintTable READONLY,
    @specializationGroups rela.ConceptSpecializationGroupTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@parentId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @parentId))
    BEGIN;
        THROW 70404, N'Parent concept not found.', 1;
    END;

    IF (@rootId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @rootId))
    BEGIN;
        THROW 70404, N'Root concept not found.', 1;
    END;

    IF ((SELECT COUNT(*) FROM app.SpecializationGroup WHERE Id IN (SELECT SpecializationGroupId FROM @specializationGroups)) != (SELECT COUNT(*) FROM @specializationGroups))
    BEGIN;
        THROW 70404, N'SpecializationGroup not found.', 1;
    END;

    BEGIN TRAN;
    BEGIN TRY
        DECLARE @ids app.ResourceIdTable;

        INSERT INTO app.Concept (
            UniversalId,
            ParentId,
            RootId,
            ExternalId,
            ExternalParentId,
            IsPatientCountAutoCalculated,
            [IsNumeric],
            IsParent,
            IsRoot,
            IsSpecializable,
            SqlSetId,
            SqlSetWhere,
            SqlFieldNumeric,
            UiDisplayName,
            UiDisplayText,
            UiDisplaySubtext,
            UiDisplayUnits,
            UiDisplayTooltip,
            UiDisplayPatientCount,
            UiNumericDefaultText,
            ContentLastUpdateDateTime,
            PatientCountLastUpdateDateTime
        )
        OUTPUT inserted.Id INTO @ids
        SELECT
            UniversalId = @universalId,
            ParentId = @parentId,
            RootId = @rootId,
            ExternalId = @externalId,
            ExternalParentId = @externalParentId,
            IsPatientCountAutoCalculated = @isPatientCountAutoCalculated,
            [IsNumeric] = @isNumeric,
            IsParent = @isParent,
            IsRoot = @isRoot,
            IsSpecializable = @isSpecializable,
            SqlSetId = @sqlSetId,
            SqlSetWhere = @sqlSetWhere,
            SqlFieldNumeric = @sqlFieldNumeric,
            UiDisplayName = @uiDisplayName,
            UiDisplayText = @uiDisplayText,
            UiDisplaySubtext = @uiDisplaySubtext,
            UiDisplayUnits = @uiDisplayUnits,
            UiDisplayTooltip = @uiDisplayTooltip,
            UiDisplayPatientCount = @uiDisplayPatientCount,
            UiNumericDefaultText = @uiNumericDefaultText,
            ContentLastUpdateDateTime = GETDATE(),
            PatientCountLastUpdateDateTime = GETDATE();

        DECLARE @id UNIQUEIDENTIFIER;
        SELECT TOP 1 @id = Id FROM @ids;

        INSERT INTO auth.ConceptConstraint
        SELECT @id, ConstraintId, ConstraintValue
        FROM @constraints;

        INSERT INTO rela.ConceptSpecializationGroup
        SELECT @id, SpecializationGroupId, OrderId
        FROM @specializationGroups;

		IF (@isRoot = 1)
		BEGIN
			UPDATE app.Concept
			SET RootId = @id
			WHERE Id = @id
		END

        COMMIT;

        EXEC adm.sp_GetConceptById @id;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO


IF OBJECT_ID('adm.sp_UpdateConcept', 'P') IS NOT NULL
	DROP PROCEDURE [adm].[sp_UpdateConcept]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/29
-- Description: Updates an app.Concept along with auth.ConceptConstraint and rela.ConceptSpecializationGroup.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateConcept]
    @id uniqueidentifier,
    @universalId nvarchar(200),
    @parentId uniqueidentifier,
    @rootId uniqueidentifier,
    @externalId nvarchar(200),
    @externalParentId nvarchar(200),
    @isPatientCountAutoCalculated bit,
    @isNumeric bit,
    @isParent bit,
    @isRoot bit,
    @isSpecializable bit,
    @sqlSetId int,
    @sqlSetWhere nvarchar(1000),
    @sqlFieldNumeric nvarchar(1000),
    @uiDisplayName nvarchar(400),
    @uiDisplayText nvarchar(1000),
    @uiDisplaySubtext nvarchar(100),
	@uiDisplayUnits nvarchar(50),
	@uiDisplayTooltip nvarchar(max),
	@uiDisplayPatientCount int,
	@uiNumericDefaultText nvarchar(50),
    @constraints auth.ResourceConstraintTable READONLY,
    @specializationGroups rela.ConceptSpecializationGroupTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @id)
    BEGIN;
        THROW 70404, N'Concept not found.', 1;
    END;

    IF (@parentId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @parentId))
    BEGIN;
        THROW 70404, N'Parent concept not found.', 1;
    END;

    IF (@rootId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @rootId))
    BEGIN;
        THROW 70404, N'Root concept not found.', 1;
    END;

    IF ((SELECT COUNT(*) FROM app.SpecializationGroup WHERE Id IN (SELECT SpecializationGroupId FROM @specializationGroups)) != (SELECT COUNT(*) FROM @specializationGroups))
    BEGIN;
        THROW 70404, N'SpecializationGroup not found.', 1;
    END;

    BEGIN TRAN;
    BEGIN TRY

		DECLARE @oldRootId UNIQUEIDENTIFIER = (SELECT TOP 1 RootId FROM app.Concept WHERE Id = @id)

        UPDATE app.Concept
        SET
            UniversalId = @universalId,
            ParentId = @parentId,
            RootId = @rootId,
            ExternalId = @externalId,
            ExternalParentId = @externalParentId,
            IsPatientCountAutoCalculated = @isPatientCountAutoCalculated,
            [IsNumeric] = @isNumeric,
            IsParent = @isParent,
            IsRoot = @isRoot,
            IsSpecializable = @isSpecializable,
            SqlSetId = @sqlSetId,
            SqlSetWhere = @sqlSetWhere,
            SqlFieldNumeric = @sqlFieldNumeric,
            UiDisplayName = @uiDisplayName,
            UiDisplayText = @uiDisplayText,
            UiDisplaySubtext = @uiDisplaySubtext,
            UiDisplayUnits = @uiDisplayUnits,
            UiDisplayTooltip = @uiDisplayTooltip,
            UiDisplayPatientCount = @uiDisplayPatientCount,
            UiNumericDefaultText = @uiNumericDefaultText,
            ContentLastUpdateDateTime = GETDATE(),
            PatientCountLastUpdateDateTime = CASE WHEN UiDisplayPatientCount = @uiDisplayPatientCount THEN PatientCountLastUpdateDateTime ELSE GETDATE() END
        WHERE Id = @id;

		IF (@rootId != @oldRootId)

		BEGIN
			; WITH descendents AS
			(
				SELECT Id = @id
				UNION ALL
				SELECT C2.Id
				FROM descendents AS D
					 INNER JOIN app.Concept AS C2
						ON C2.ParentId = D.Id
			)
			SELECT DISTINCT Id
			INTO #descendents
			FROM descendents

			UPDATE app.Concept
			SET RootId = @rootId
			FROM app.Concept AS C
			WHERE EXISTS (SELECT 1 FROM #descendents AS D WHERE C.Id = D.Id)

			UPDATE app.ConceptForwardIndex
			SET RootId = @rootId
			FROM app.Concept C
				 INNER JOIN app.ConceptForwardIndex FI
					ON C.Id = FI.ConceptId
			WHERE EXISTS (SELECT 1 FROM #descendents AS D WHERE C.Id = D.Id)

			DROP TABLE #descendents

		END

        DELETE FROM auth.ConceptConstraint
        WHERE ConceptId = @id;

        INSERT INTO auth.ConceptConstraint
        SELECT @id, ConstraintId, ConstraintValue
        FROM @constraints;

        DELETE FROM rela.ConceptSpecializationGroup
        WHERE ConceptId = @id;

        INSERT INTO rela.ConceptSpecializationGroup
        SELECT @id, SpecializationGroupId, OrderId
        FROM @specializationGroups;

        COMMIT;

        EXEC adm.sp_GetConceptById @id;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO

IF TYPE_ID('[auth].[ConceptConstraintTable]') IS NOT NULL
    DROP TYPE [auth].[ConceptConstraintTable]
GO



-- Create admin DatasetQuery management stored procedures.
IF OBJECT_ID('app.sp_GetDatasetQueries', 'P') IS NOT NULL
        DROP PROCEDURE [app].[sp_GetDatasetQueries]
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

    declare @ids table (
        Id UNIQUEIDENTIFIER NOT NULL
    );

    IF (@admin = 1)
    BEGIN;
        -- user is an admin, load them all
        INSERT INTO @ids
        SELECT Id
        FROM app.DatasetQuery;
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
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
    END;

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


IF OBJECT_ID('adm.sp_GetDatasetQueryById', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_GetDatasetQueryById]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Get an app.DatasetQuery by Id for admins.
-- =======================================
CREATE PROCEDURE adm.sp_GetDatasetQueryById
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    -- Get query definition.
    SELECT
        dq.Id,
        dq.UniversalId,
        dq.Shape,
        dq.Name,
        dq.CategoryId,
        dq.[Description],
        dq.SqlStatement,
        dq.Created,
        dq.CreatedBy,
        dq.Updated,
        dq.UpdatedBy
    FROM app.DatasetQuery dq
    WHERE dq.Id = @id;

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

-- DROP relying sprocs ahead of DROP - CREATE of tag type
IF OBJECT_ID('adm.sp_UpdateDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_UpdateDatasetQuery]
GO
IF OBJECT_ID('adm.sp_CreateDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_CreateDatasetQuery]
GO

IF TYPE_ID('[app].[DatasetQueryName]') IS NOT NULL
	DROP TYPE [app].[DatasetQueryName];
GO
IF TYPE_ID('[app].[DatasetQueryTagTable]') IS NOT NULL
	DROP TYPE [app].[DatasetQueryTagTable];
GO
CREATE TYPE [app].[DatasetQueryTagTable] AS TABLE(
	[Tag] [nvarchar](100) NOT NULL
)
GO


IF OBJECT_ID('adm.sp_UpdateDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_UpdateDatasetQuery]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Update a datasetquery.
-- =======================================
CREATE PROCEDURE adm.sp_UpdateDatasetQuery
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

        IF EXISTS (SELECT 1 FROM app.DatasetQuery WHERE Id != @id AND (@uid = UniversalId OR @name = Name))
            THROW 70409, N'DatasetQuery already exists with universal id or name value.', 1;

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


IF OBJECT_ID('adm.sp_CreateDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_CreateDatasetQuery]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Create a datasetquery.
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

        IF EXISTS (SELECT 1 FROM app.DatasetQuery WHERE @uid = UniversalId OR @name = Name)
            THROW 70409, N'DatasetQuery already exists with universal id or name value.', 1;

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


IF OBJECT_ID('adm.sp_DeleteDatasetQuery', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_DeleteDatasetQuery]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Delete an app.DatasetQuery.
-- =======================================
CREATE PROCEDURE adm.sp_DeleteDatasetQuery
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
GO


-- Concept Management stored procedure fixes.
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IXUniq_ConceptEvent_UiDisplayEventName')
    DROP INDEX [IXUniq_ConceptEvent_UiDisplayEventName] ON app.ConceptEvent;
GO
CREATE UNIQUE INDEX IXUniq_ConceptEvent_UiDisplayEventName ON [app].[ConceptEvent](UiDisplayEventName);
GO

IF OBJECT_ID('adm.sp_CreateConceptEvent', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateConceptEvent];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Create a new app.ConceptSqlEvent.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateConceptEvent]
    @uiDisplayEventName nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@uiDisplayEventName) = 1)
        THROW 70400, N'ConceptSqlEvent.UiDisplayEventName is required.', 1;

    BEGIN TRAN;
    BEGIN TRY

        IF EXISTS (SELECT 1 FROM app.ConceptEvent WHERE UiDisplayEventName = @uiDisplayEventName)
            THROW 70409, N'ConceptEvent already exists with that UiDisplayEventName.', 1;

        INSERT INTO app.ConceptEvent (UiDisplayEventName, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.UiDisplayEventName
        VALUES (@uiDisplayEventName, GETDATE(), @user, GETDATE(), @user);
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO


IF OBJECT_ID('adm.sp_UpdateConceptEvent', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateConceptEvent];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Updates an app.ConceptSqlEvent.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateConceptEvent]
    @id int,
    @uiDisplayEventName nvarchar(50),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'ConceptSqlEvent.Id is required.', 1;

    IF (app.fn_NullOrWhitespace(@uiDisplayEventName) = 1)
        THROW 70400, N'ConceptSqlEvent.UiDisplayEventName is required', 1;

    BEGIN TRAN;
    BEGIN TRY

        IF EXISTS (SELECT 1 FROM app.ConceptEvent WHERE Id != @id AND UiDisplayEventName = @uiDisplayEventName)
            THROW 70409, N'ConceptEvent already exists with that UiDisplayEventName.', 1;

        UPDATE app.ConceptEvent
        SET
            UiDisplayEventName = @uiDisplayEventName,
            Updated = GETDATE(),
            UpdatedBy = @user
        OUTPUT inserted.Id, inserted.UiDisplayEventName
        WHERE
            Id = @id;
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO


IF OBJECT_ID('adm.sp_CreateConceptEvent', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateConceptEvent];
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Create a new app.ConceptSqlEvent.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateConceptEvent]
    @uiDisplayEventName nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@uiDisplayEventName) = 1)
        THROW 70400, N'ConceptSqlEvent.UiDisplayEventName is required.', 1;

    BEGIN TRAN;
    BEGIN TRY

        IF EXISTS (SELECT 1 FROM app.ConceptEvent WHERE UiDisplayEventName = @uiDisplayEventName)
            THROW 70409, N'ConceptEvent already exists with that UiDisplayEventName.', 1;

        INSERT INTO app.ConceptEvent (UiDisplayEventName, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.UiDisplayEventName
        VALUES (@uiDisplayEventName, GETDATE(), @user, GETDATE(), @user);
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO


IF OBJECT_ID('adm.sp_UpdateConceptSqlSet', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateConceptSqlSet];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/8/3
-- Description: Updates an app.ConceptSqlSet.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateConceptSqlSet]
    @id int,
    @isEncounterBased bit,
    @isEventBased bit,
    @sqlSetFrom nvarchar(1000),
    @sqlFieldDate nvarchar(1000),
    @sqlFieldEvent nvarchar(400),
    @eventId int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'ConceptSqlSet.Id is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@sqlSetFrom) = 1)
        THROW 70400, N'ConceptSqlSet.SqlSetFrom is required.', 1;

    UPDATE app.ConceptSqlSet
    SET
        IsEncounterBased = @isEncounterBased,
        IsEventBased = @isEventBased,
        SqlSetFrom = @sqlSetFrom,
        SqlFieldDate = @sqlFieldDate,
        SqlFieldEvent = @sqlFieldEvent,
        EventId = @eventId,
        Updated = GETDATE(),
        UpdatedBy = @user
    OUTPUT inserted.Id, inserted.IsEncounterBased, inserted.IsEventBased, inserted.SqlSetFrom, inserted.SqlFieldDate, inserted.SqlFieldEvent, inserted.EventId
    WHERE Id = @id;
END
GO


IF OBJECT_ID('adm.sp_CreateSpecialization', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateSpecialization];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Create a new app.Specialization.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateSpecialization]
    @groupId int,
    @uid app.UniversalId,
    @uiDisplayText nvarchar(100),
    @sqlSetWhere nvarchar(1000),
    @order int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@groupId) = 1)
        THROW 70400, N'Specialization.SpecializationGroupId is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@uiDisplayText) = 1)
        THROW 70400, N'Specialization.UiDisplayText is required.', 1;

    IF (app.fn_NullOrWhitespace(@sqlSetWhere) = 1)
        THROW 70400, N'Specialization.SqlSetWhere is required.', 1;

    IF NOT EXISTS (SELECT 1 FROM app.SpecializationGroup WHERE Id = @groupId)
        THROW 70409, N'SpecializationGroup is missing.', 1;

    INSERT INTO app.Specialization (SpecializationGroupId, UniversalId, UiDisplayText, SqlSetWhere, OrderId)
    OUTPUT inserted.Id, inserted.SpecializationGroupId, inserted.UniversalId, inserted.UiDisplayText, inserted.SqlSetWhere, inserted.OrderId
    VALUES (@groupId, @uid, @uiDisplayText, @sqlSetWhere, @order);
END
GO


IF OBJECT_ID('adm.sp_UpdateSpecialization', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateSpecialization];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Updates an app.Specialization.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateSpecialization]
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

    IF (app.fn_NullOrWhitespace(@uiDisplayText) = 1)
        THROW 70400, N'Specialization.UiDisplayText is required.', 1;

    IF (app.fn_NullOrWhitespace(@sqlSetWhere) = 1)
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


IF OBJECT_ID('adm.sp_CreateSpecializationGroup', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_CreateSpecializationGroup];
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
    IF (app.fn_NullOrWhitespace(@sqlSetId) = 1)
        THROW 70400, N'SpecializationGroup.SqlSetId is missing.', 1;
    
    IF (app.fn_NullOrWhitespace(@uiDefaultText) = 1)
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


IF OBJECT_ID('adm.sp_UpdateSpecializationGroup', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateSpecializationGroup];
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/14
-- Description: Updates an app.SpecializationGroup.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateSpecializationGroup]
    @id int,
    @sqlSetId int,
    @uiDefaultText nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'SpecializationGroup.Id is required.', 1;

    IF (app.fn_NullOrWhitespace(@sqlSetId) = 1)
        THROW 70400, N'SpecializationGroup.SqlSetId is missing.', 1;
    
    IF (app.fn_NullOrWhitespace(@uiDefaultText) = 1)
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


-- Create DatasetQueryCategory management stored procedures
IF OBJECT_ID('adm.sp_CreateDatasetQueryCategory', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_CreateDatasetQueryCategory]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Creates an app.DatasetQueryCategory
-- =======================================
CREATE PROCEDURE adm.sp_CreateDatasetQueryCategory
    @cat nvarchar(200),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@cat) = 1)
        THROW 70400, N'DatasetQueryCategory.Category is required.', 1;

    BEGIN TRAN;
    BEGIN TRY
        IF EXISTS(SELECT Id FROM app.DatasetQueryCategory WHERE Category = @cat)
            THROW 70409, N'DatasetQueryCategory already exists with that name.', 1;
        
        INSERT INTO app.DatasetQueryCategory (Category, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.Category, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy
        VALUES(@cat, GETDATE(), @user, GETDATE(), @user);

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO


IF OBJECT_ID('adm.sp_GetDatasetQueryCategory', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_GetDatasetQueryCategory]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Gets all DatasetQueryCategory.
-- =======================================
CREATE PROCEDURE adm.sp_GetDatasetQueryCategory    
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        Id,
        Category,
        Created,
        CreatedBy,
        Updated,
        UpdatedBy
    FROM app.DatasetQueryCategory;
END
GO


IF OBJECT_ID('adm.sp_UpdateDatasetQueryCategory', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_UpdateDatasetQueryCategory]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/6
-- Description: Updates an app.DatasetQueryCategory.
-- =======================================
CREATE PROCEDURE adm.sp_UpdateDatasetQueryCategory
    @id int,
    @cat nvarchar(200),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'DatasetQueryCategory.Id is required.', 1;

    IF (app.fn_NullOrWhitespace(@cat) = 1)
        THROW 70400, N'DatasetQueryCategory.Category is required.', 1;

    BEGIN TRAN;
    BEGIN TRY
        IF NOT EXISTS(SELECT 1 FROM app.DatasetQueryCategory WHERE Id = @id)
            THROW 70404, N'DatasetQueryCategory not found.', 1;

        IF EXISTS(SELECT Id FROM app.DatasetQueryCategory WHERE Id != @id AND Category = @cat)
            THROW 70409, N'DatasetQueryCategory already exists with that name.', 1;
        
        UPDATE app.DatasetQueryCategory
        SET
            Category = @cat,
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


IF OBJECT_ID('adm.sp_DeleteDatasetQueryCategory', 'P') IS NOT NULL
        DROP PROCEDURE [adm].[sp_DeleteDatasetQueryCategory]
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/6
-- Description: Delete an app.DatasetQueryCategory if there are no dependents.
-- =======================================
CREATE PROCEDURE adm.sp_DeleteDatasetQueryCategory
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.DatasetQueryCategory WHERE Id = @id)
        THROW 70404, N'DatasetQueryCategory not found.', 1;
    
    BEGIN TRAN;

    DECLARE @deps TABLE (
        Id uniqueidentifier not null
    );
    INSERT INTO @deps (Id)
    SELECT Id
    FROM app.DatasetQuery
    WHERE CategoryId = @id;

    IF EXISTS(SELECT 1 FROM @deps)
    BEGIN;
        -- there are dependents, bail
        ROLLBACK;

        SELECT Id
        FROM @deps;

        RETURN;
    END;

    DELETE FROM app.DatasetQueryCategory
    WHERE Id = @id;

    COMMIT;

    -- No dependents.
    SELECT Id = NULL
    WHERE 0 = 1;
END
GO

-- Demographic query fetch
IF OBJECT_ID('adm.sp_GetDemographicQuery', 'P') IS NOT NULL
    DROP PROCEDURE adm.sp_GetDemographicQuery;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/12
-- Description: Fetch the app.DemographicQuery record for an admin.
-- =======================================
CREATE PROCEDURE adm.sp_GetDemographicQuery
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        SqlStatement,
        LastChanged,
        ChangedBy
    FROM app.DemographicQuery;
END
GO


IF OBJECT_ID('adm.sp_UpdateDemographicQuery', 'P') IS NOT NULL
    DROP PROCEDURE adm.sp_UpdateDemographicQuery;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/12
-- Description: Update the app.DemographicQuery record
-- =======================================
CREATE PROCEDURE adm.sp_UpdateDemographicQuery
    @sql nvarchar(4000),
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
                LastChanged = GETDATE(),
                ChangedBy = @user
            OUTPUT
                inserted.SqlStatement,
                inserted.LastChanged,
                inserted.ChangedBy;
        END;
        ELSE
        BEGIN;
            INSERT INTO app.DemographicQuery (SqlStatement, LastChanged, ChangedBy)
            OUTPUT inserted.SqlStatement, inserted.LastChanged, inserted.ChangedBy
            VALUES (@sql, GETDATE(), @user);
        END;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO

IF OBJECT_ID('app.sp_GetSavedBaseQueriesByConstraint', 'P') IS NOT NULL
    DROP PROCEDURE app.sp_GetSavedBaseQueriesByConstraint;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieves all saved query pointers owned by the given user.
-- =======================================
CREATE PROCEDURE [app].[sp_GetSavedBaseQueriesByConstraint]
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
        [Count] = COUNT(c.QueryId)
    FROM app.Query q
    LEFT JOIN app.Cohort c on q.Id = c.QueryId
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

IF OBJECT_ID('app.sp_GetSavedBaseQueriesByOwner', 'P') IS NOT NULL
    DROP PROCEDURE app.sp_GetSavedBaseQueriesByOwner;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/29
-- Description: Retrieves all saved query pointers owned by the given user.
-- =======================================
CREATE PROCEDURE [app].[sp_GetSavedBaseQueriesByOwner]
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
        [Count] = COUNT(c.QueryId)
    FROM
        app.Query q
    LEFT JOIN app.Cohort c on q.Id = c.QueryId
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

IF OBJECT_ID('adm.sp_DeleteConcept', 'P') IS NOT NULL
    DROP PROCEDURE adm.sp_DeleteConcept;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/4/1
-- Description: Deletes a concept if unhooked, returns dependents.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteConcept]
    @id uniqueidentifier,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;

    IF NOT EXISTS(SELECT 1 FROM app.Concept WHERE Id = @id)
    BEGIN;
        THROW 70404, N'Concept not found.', 1;
    END;

    declare @filters table (
        Id int,
        UiDisplayText nvarchar(1000) NULL
    );
    INSERT INTO @filters
    SELECT Id, UiDisplayText
    FROM app.PanelFilter
    WHERE ConceptId = @id;

    declare @queries table (
        Id uniqueidentifier,
        UniversalId nvarchar(200) null,
        [Name] nvarchar(200) null,
        [Owner] nvarchar(200) not null
    );
    INSERT INTO @queries
    SELECT q.Id, q.UniversalId, q.[Name], q.[Owner]
    FROM app.Query q
    JOIN rela.QueryConceptDependency cd on q.Id = cd.QueryId
    WHERE cd.DependsOn = @id;

    declare @concepts table(
        Id UNIQUEIDENTIFIER,
        UniversalId nvarchar(200) null,
        UiDisplayName nvarchar(400) null
    );
    INSERT INTO @concepts
    SELECT Id, UniversalId, UiDisplayName
    FROM app.Concept
    WHERE ParentId = @id OR (RootId = @id AND Id != @id);

    IF NOT(EXISTS(SELECT 1 FROM @filters) OR EXISTS(SELECT 1 FROM @queries) OR EXISTS(SELECT 1 FROM @concepts))
    BEGIN;
        BEGIN TRY
            DELETE FROM auth.ConceptConstraint
            WHERE ConceptId = @id;

            DELETE FROM rela.ConceptSpecializationGroup
            WHERE ConceptId = @id;

            DELETE FROM app.ConceptForwardIndex
            WHERE ConceptId = @id;

            DELETE FROM app.ConceptTokenizedIndex
            WHERE ConceptId = @id;

            DELETE FROM app.Concept
            WHERE Id = @id;

            COMMIT;
        END TRY
        BEGIN CATCH
            ROLLBACK;
        END CATCH;
    END;
    ELSE
    BEGIN;
        ROLLBACK;
    END;

    SELECT Id, UiDisplayText
    FROM @filters;
    SELECT Id, UniversalId, [Name], [Owner]
    FROM @queries;
    SELECT Id, UniversalId, UiDisplayName
    FROM @concepts;
END
GO


-- set version
INSERT INTO [ref].[Version] (Lock, [Version])
SELECT 'X', N'3.2.0';