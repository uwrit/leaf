-- Copyright (c) 2019, UW Medicine Research IT
-- Developed by Nic Dobbins and Cliff Spital
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetDemographicQuery]    Script Date: 3/28/19 1:44:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/28
-- Description: Retrieves the DemographicQuery record.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDemographicQuery]
AS
BEGIN
    SET NOCOUNT ON

    SELECT TOP 1
        SqlStatement
    FROM app.DemographicQuery
END







GO
