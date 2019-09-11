-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetGeneralEquivalenceMapping]    Script Date: 9/11/19 9:24:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Nic Dobbins
-- Create date: 2018/9/20
-- Description:	Gets the closest estimated ICD9->10 or ICD10->9 equivalent
-- =============================================
CREATE PROCEDURE [app].[sp_GetGeneralEquivalenceMapping]
	@source nvarchar(50)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT TOP (1) 
		 [TargetCode]
		,[TargetCodeType]
		,[UiDisplayTargetName]
    FROM [app].[GeneralEquivalenceMapping]
    WHERE SourceCode LIKE @source + '%'

END








GO
