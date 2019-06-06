-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateConceptEvent]    Script Date: 6/6/19 8:49:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Updates an app.ConceptSqlEvent.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateConceptEvent]
    @id int,
    @uiDisplayEventName nvarchar(50),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@id IS NULL)
        THROW 70400, N'ConceptSqlEvent.Id is required.', 1;

    IF (@uiDisplayEventName IS NULL OR LEN(@uiDisplayEventName) = 0)
        THROW 70400, N'ConceptSqlEvent.UiDisplayEventName is required', 1;

    UPDATE app.ConceptEvent
    SET
        UiDisplayEventName = @uiDisplayEventName,
        Updated = GETDATE(),
        UpdatedBy = @user
    OUTPUT inserted.Id, inserted.UiDisplayEventName
    WHERE
        Id = @id;

END




GO
