-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [network].[sp_GetEndpoints]    Script Date: 11/4/2019 11:22:24 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Gets all network.Endpoint records.
-- =============================================
CREATE PROCEDURE [network].[sp_GetEndpoints]
AS
BEGIN
	SET NOCOUNT ON;

    SELECT
		Id,
		Name,
		Address,
		Issuer,
		KeyId,
		Certificate,
        IsInterrogator,
        IsResponder
	FROM
		network.Endpoint;
END











GO
