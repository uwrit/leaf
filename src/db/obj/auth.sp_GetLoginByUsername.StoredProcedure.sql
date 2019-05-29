-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [auth].[sp_GetLoginByUsername]    Script Date: 5/29/19 9:58:40 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/8
-- Description:	Retrieves an auth.Login by username.
-- =============================================
CREATE PROCEDURE [auth].[sp_GetLoginByUsername]
	@username nvarchar(50)
AS
BEGIN
	SET NOCOUNT ON;

    SELECT
		Id,
		Username,
		Salt,
		Hash
	FROM
		auth.Login
	WHERE
		Username = @username;
END







GO
