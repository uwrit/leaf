-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetConceptSqlSets]    Script Date: 4/1/19 1:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/7
-- Description: Gets all app.ConceptSqlSet records.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetConceptSqlSets]    
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
