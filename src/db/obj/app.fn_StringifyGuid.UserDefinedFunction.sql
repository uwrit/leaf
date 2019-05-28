-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [app].[fn_StringifyGuid]    Script Date: 5/28/19 1:33:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Converts a UNIQUEIDENTIFIER to NVARCHAR(50)
-- =======================================
CREATE FUNCTION [app].[fn_StringifyGuid]
(
    @guid UNIQUEIDENTIFIER
)
RETURNS nvarchar(50)
AS
BEGIN
    RETURN cast(@guid as nvarchar(50));
END




GO
