-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [network].[sp_CreateEndpoint]    Script Date: 4/1/19 1:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Creates a new network.Endpoint record.
-- =============================================
CREATE PROCEDURE [network].[sp_CreateEndpoint]
	@name nvarchar(200),
	@address nvarchar(1000),
	@issuer nvarchar(200),
	@keyid nvarchar(200),
	@certificate nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;

    INSERT INTO network.Endpoint
	(
		Name,
		Address,
		Issuer,
		KeyId,
		Certificate
	)
	OUTPUT inserted.Id
	SELECT
		@name,
		@address,
		@issuer,
		@keyid,
		@certificate 
END










GO
