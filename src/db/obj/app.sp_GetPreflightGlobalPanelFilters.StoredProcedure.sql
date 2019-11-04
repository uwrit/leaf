-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightGlobalPanelFilters]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/5
-- Description: Retrieves global panel filters 
--              relevant to current session context
-- =======================================
CREATE PROCEDURE [app].[sp_GetPreflightGlobalPanelFilters]
    @sessionType auth.SessionType
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        GPF.Id
      , GPF.IsInclusion
      , CS.SqlSetFrom
      , GPF.SqlSetWhere
    FROM app.GlobalPanelFilter AS GPF
         INNER JOIN app.ConceptSqlSet AS CS
            ON GPF.SqlSetId = CS.Id
    WHERE (GPF.SessionType = @sessionType OR GPF.SessionType IS NULL)
    
END
GO
