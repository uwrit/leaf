-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreatePanelFilter]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/8/26
-- Description: Create a new app.PanelFilter.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreatePanelFilter]
    @conceptId uniqueidentifier,
    @isInclusion bit,
	@uiDisplayText nvarchar(1000),
	@uiDisplayDescription nvarchar(4000),
	@user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

	IF NOT EXISTS (SELECT 1 FROM app.Concept WHERE Id = @conceptId)
        THROW 70400, N'PanelFilter.Concept does not exist.', 1;

    IF (app.fn_NullOrWhitespace(@uiDisplayText) = 1)
        THROW 70400, N'PanelFilter.UiDisplayText is required.', 1;

	IF (app.fn_NullOrWhitespace(@uiDisplayDescription) = 1)
        THROW 70400, N'PanelFilter.UiDisplayDescription is required.', 1;

    BEGIN TRAN;
    BEGIN TRY

        IF EXISTS (SELECT 1 FROM app.PanelFilter WHERE ConceptId = @conceptId AND IsInclusion = @isInclusion)
            THROW 70409, N'PanelFilter already exists with that ConceptId and Inclusion setting.', 1;

        INSERT INTO app.PanelFilter (ConceptId, IsInclusion, UiDisplayText, UiDisplayDescription, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT 
			inserted.Id
		  , inserted.ConceptId
		  , inserted.IsInclusion
		  , inserted.UiDisplayText
		  , inserted.UiDisplayDescription
        VALUES (@conceptId, @isInclusion, @uiDisplayText, @uiDisplayDescription, GETDATE(), @user, GETDATE(), @user);
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
