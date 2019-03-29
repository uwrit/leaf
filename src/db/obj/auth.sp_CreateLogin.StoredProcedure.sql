-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [auth].[sp_CreateLogin]    Script Date: 3/28/19 1:44:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/11
-- Description:	Register a new user with username and pass.
-- =============================================
CREATE PROCEDURE [auth].[sp_CreateLogin]
	@username nvarchar(50),
	@salt varbinary(16),
	@hash varbinary(8000)
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO auth.Login (Username, Salt, Hash)
	OUTPUT inserted.Id
	SELECT @username, @salt, @hash;
END







GO
