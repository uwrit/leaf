-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetGlobalPanelFilters]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/8/26
-- Description: Gets all GlobalPanelFilters.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetGlobalPanelFilters]
AS
BEGIN
    
	SELECT
		Id
	  , SessionType
	  , IsInclusion
	  , SqlSetId
	  , SqlSetWhere
	FROM app.GlobalPanelFilter

END
GO
