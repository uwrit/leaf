-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [network].[sp_GetIdentity]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/11
-- Description: Returns the network.Identity
-- =======================================
CREATE PROCEDURE [network].[sp_GetIdentity]
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        [Name],
        Abbreviation,
        [Description],
        TotalPatients,
        Latitude,
        Longitude,
        PrimaryColor,
        SecondaryColor
    FROM network.[Identity];
END







GO
