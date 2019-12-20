-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetUsersBySearchTerm]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/11/15
-- Description: Retrieves all users who matching a given search string.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetUsersBySearchTerm]
    @term NVARCHAR(50),
	@limit INT = 10
AS
BEGIN
    SET NOCOUNT ON

    SELECT TOP (@limit)
		L.Id
	  , L.ScopedIdentity
	  , L.FullIdentity
	  , SavedQueryCount = (SELECT COUNT(*) FROM [app].[Query] AS Q WHERE L.FullIdentity = Q.[Owner] AND Q.UniversalId IS NOT NULL AND Q.Nonce IS NULL)
	  , L.Created
	  , L.Updated
	FROM auth.[Login] AS L
	WHERE L.ScopedIdentity LIKE @term + '%'

END
GO
