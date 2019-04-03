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

	DECLARE @specializedGroups app.ListTable

	-- Get specialization groups for
	-- the concepts to be retrieved
	INSERT INTO @specializedGroups (Id)
	SELECT sg.Id
	FROM app.SpecializationGroup sg
	WHERE EXISTS (SELECT 1 
				  FROM rela.ConceptSpecializationGroup csg
					   INNER JOIN app.Concept c
							ON csg.ConceptId = c.Id
				  WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)
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
    WHERE EXISTS (SELECT 1 FROM @ids i WHERE c.Id = i.Id)
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
	WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = csg.ConceptId)
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
    
END
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/29
-- Description: Creates an app.Concept along with auth.ConceptConstraint and rela.ConceptSpecializationGroup.
-- =======================================
ALTER PROCEDURE [adm].[sp_CreateConcept]
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
    @constraints auth.ConceptConstraintTable READONLY,
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


-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/4/1
-- Description: Deletes a concept if unhooked, returns dependents.
-- =======================================
ALTER PROCEDURE [adm].[sp_DeleteConcept]
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
    WHERE ParentId = @id;

    IF NOT(EXISTS(SELECT 1 FROM @filters) OR EXISTS(SELECT 1 FROM @queries) OR EXISTS(SELECT 1 FROM @concepts))
    BEGIN;
        BEGIN TRY
            DELETE FROM auth.ConceptConstraint
            WHERE ConceptId = @id;

            DELETE FROM rela.ConceptSpecializationGroup
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







ALTER TABLE app.Concept
DROP COLUMN IsEnabled

ALTER TABLE app.PanelFilter
DROP CONSTRAINT DF__PanelFilt__IsEna__06CD04F7

ALTER TABLE app.PanelFilter
DROP COLUMN IsEnabled