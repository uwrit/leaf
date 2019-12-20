-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteSpecialization]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/11
-- Description: Deletes an app.Specialization by id.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteSpecialization]
    @id UNIQUEIDENTIFIER,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM app.Specialization
    OUTPUT deleted.Id, deleted.SpecializationGroupId, deleted.UniversalId, deleted.UiDisplayText, deleted.SqlSetWhere, deleted.OrderId
    WHERE Id = @id;
END




GO
