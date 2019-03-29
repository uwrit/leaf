-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetSpecializationsByGroupId]    Script Date: 3/28/19 1:44:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Gets all app.Specialization by SpecializationGroupId.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetSpecializationsByGroupId]
    @groupId int
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @s TABLE (
        Id UNIQUEIDENTIFIER not null,
        SpecializationGroupId int not null,
        UniversalId nvarchar(200),
        UiDisplayText nvarchar(100) not null,
        SqlSetWhere nvarchar(1000) not null,
        OrderId int
    )

    INSERT INTO @s
    SELECT
        Id,
        SpecializationGroupId,
        UniversalId,
        UiDisplayText,
        SqlSetWhere,
        OrderId
    FROM app.Specialization
    WHERE SpecializationGroupId = @groupId;

    IF NOT EXISTS(SELECT 1 FROM @s) AND NOT EXISTS(SELECT 1 FROM app.SpecializationGroup WHERE Id = @groupId)
        THROW 70404, N'SpecializationGroup is missing.', 1;
    
    SELECT
        Id,
        SpecializationGroupId,
        UniversalId,
        UiDisplayText,
        SqlSetWhere,
        OrderId
    FROM @s;
END



GO
