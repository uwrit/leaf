-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetSpecializationGroups]    Script Date: 4/1/19 9:36:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/13
-- Description: Gets all app.SpecializationGroup and associated app.Specialization.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetSpecializationGroups]
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
