-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetConceptById]    Script Date: 4/8/19 2:27:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/19
-- Description: Retrieve a fully hydrated Admin.Concept by Id.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetConceptById]
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
