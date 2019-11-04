-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreateConceptEvent]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Create a new app.ConceptSqlEvent.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateConceptEvent]
    @uiDisplayEventName nvarchar(100),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@uiDisplayEventName) = 1)
        THROW 70400, N'ConceptSqlEvent.UiDisplayEventName is required.', 1;

    BEGIN TRAN;
    BEGIN TRY

        IF EXISTS (SELECT 1 FROM app.ConceptEvent WHERE UiDisplayEventName = @uiDisplayEventName)
            THROW 70409, N'ConceptEvent already exists with that UiDisplayEventName.', 1;

        INSERT INTO app.ConceptEvent (UiDisplayEventName, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.UiDisplayEventName
        VALUES (@uiDisplayEventName, GETDATE(), @user, GETDATE(), @user);
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
