-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [auth].[sp_BlacklistToken]    Script Date: 4/8/19 2:16:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/9/27
-- Description: Blacklists a token
-- =======================================
CREATE PROCEDURE [auth].[sp_BlacklistToken]
    @idNonce UNIQUEIDENTIFIER,
    @exp datetime
AS
BEGIN
    SET NOCOUNT ON

    INSERT INTO auth.TokenBlacklist
    VALUES (@idNonce, @exp);
END






GO
