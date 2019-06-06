-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [network].[sp_GetIdentityEndpoints]    Script Date: 6/6/19 8:49:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/11
-- Description: Returns the network.Identity and the network.Endpoint
-- =======================================
CREATE PROCEDURE [network].[sp_GetIdentityEndpoints]
AS
BEGIN
    SET NOCOUNT ON

    EXEC network.sp_GetIdentity;

    EXEC network.sp_GetEndpoints;
END







GO
