-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetImportMetadataById]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves Import Metadata by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportMetadataById]
	@id uniqueidentifier,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @authorized BIT = [auth].[fn_UserIsAuthorizedForImportMetadataById](@user, @groups, @id, @admin)

	IF @authorized = 0
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to to use import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	SELECT 
		Id
	  , SourceId
	  , Structure
	  , [Type]
	  , Created
	  , Updated
	FROM app.ImportMetadata AS IM
	WHERE IM.Id = @id

	SELECT
		ImportMetadataId
	  , ConstraintId
	  , ConstraintValue
	FROM auth.ImportMetadataConstraint AS IMC
	WHERE IMC.ImportMetadataId = @id

END

GO
