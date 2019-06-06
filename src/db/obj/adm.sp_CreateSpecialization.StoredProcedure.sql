-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreateSpecialization]    Script Date: 6/6/19 4:01:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Create a new app.Specialization.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateSpecialization]
    @groupId int,
    @uid app.UniversalId,
    @uiDisplayText nvarchar(100),
    @sqlSetWhere nvarchar(1000),
    @order int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@groupId) = 1)
        THROW 70400, N'Specialization.SpecializationGroupId is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@uiDisplayText) = 1)
        THROW 70400, N'Specialization.UiDisplayText is required.', 1;

    IF (app.fn_NullOrWhitespace(@sqlSetWhere) = 1)
        THROW 70400, N'Specialization.SqlSetWhere is required.', 1;

    IF NOT EXISTS (SELECT 1 FROM app.SpecializationGroup WHERE Id = @groupId)
        THROW 70409, N'SpecializationGroup is missing.', 1;

    INSERT INTO app.Specialization (SpecializationGroupId, UniversalId, UiDisplayText, SqlSetWhere, OrderId)
    OUTPUT inserted.Id, inserted.SpecializationGroupId, inserted.UniversalId, inserted.UiDisplayText, inserted.SqlSetWhere, inserted.OrderId
    VALUES (@groupId, @uid, @uiDisplayText, @sqlSetWhere, @order);
END

GO
