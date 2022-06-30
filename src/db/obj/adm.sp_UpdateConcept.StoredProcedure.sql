-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateConcept]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
