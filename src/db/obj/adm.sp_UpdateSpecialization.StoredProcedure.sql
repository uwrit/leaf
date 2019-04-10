-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateSpecialization]    Script Date: 4/8/19 2:27:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Updates an app.Specialization.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateSpecialization]
    @id UNIQUEIDENTIFIER,
    @groupId int,
    @uid app.UniversalId,
    @uiDisplayText nvarchar(100),
    @sqlSetWhere nvarchar(1000),
    @order int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@groupId IS NULL)
        THROW 70400, N'Specialization.SpecializationGroupId is required.', 1;

    IF (@uiDisplayText IS NULL OR LEN(@uiDisplayText) = 0)
        THROW 70400, N'Specialization.UiDisplayText is required', 1;
    
    IF (@sqlSetWhere IS NULL OR LEN(@sqlSetWhere) = 0)
        THROW 70400, N'Specialization.SqlSetWhere is required.', 1;

    UPDATE app.Specialization
    SET
        SpecializationGroupId = @groupId,
        UniversalId = @uid,
        UiDisplayText = @uiDisplayText,
        SqlSetWhere = @sqlSetWhere,
        OrderId = @order
    OUTPUT inserted.Id, inserted.SpecializationGroupId, inserted.UniversalId, inserted.UiDisplayText, inserted.SqlSetWhere, inserted.OrderId
    WHERE
        Id = @id;

END


GO
