-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetGeometries]    Script Date: 4/8/19 2:16:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Nic Dobbins
-- Create date: 2018/9/20
-- Description:	Gets zip code GeoJson for choropleth mapping
-- =============================================
CREATE PROCEDURE [app].[sp_GetGeometries]
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
