-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetImportData]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Gets all imported records for a given metadata.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportData]
	@id uniqueidentifier,
    @user auth.[User],
	@groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM app.ImportMetadata AS IT WHERE @id = IT.Id))
    BEGIN;
        THROW 70404, N'ImportMetadata does not exist.', 1;
    END;

	DECLARE @authorized BIT = [auth].[fn_UserIsAuthorizedForImportMetadataById](@user, @groups, @id, @admin)

	IF @authorized = 0
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to access import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	DECLARE @changed INT = 0;

	SELECT
		I.Id
	  , I.ImportMetadataId
	  , I.PersonId
	  , I.SourcePersonId
	  , I.SourceValue
	  , I.ValueString
	  , I.ValueNumber
	  , I.ValueDate
	FROM app.Import AS I
	WHERE I.ImportMetadataId = @id

END

GO
