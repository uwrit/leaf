-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [app].[fn_NullOrWhitespace]    Script Date: 6/6/19 4:01:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/5
-- Description: Returns 1 if string is null or consists of only whitespace, else 0.
-- =======================================
CREATE FUNCTION [app].[fn_NullOrWhitespace]
(
    @s nvarchar(max)
)
RETURNS bit
AS
BEGIN
    IF (ISNULL(@s, N'') = N'')
        RETURN 1;

    RETURN 0;
END
GO
