-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_ImportData]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Adds import records tied to a metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_ImportData]
	@id uniqueidentifier,
	@data [app].[ImportDataTable] READONLY,
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
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to to import data for ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	DECLARE @changed INT = 0;

	-- Check for UPDATEs
	UPDATE app.Import
	SET
		PersonId = D.PersonId
	  , SourcePersonId = D.SourcePersonId
	  , SourceValue = D.SourceValue
	  , SourceModifier = D.SourceModifier
	  , ValueString = D.ValueString
	  , ValueNumber = D.ValueNumber
	  , ValueDate = D.ValueDate
	FROM @data AS D
		 INNER JOIN app.Import AS I
			ON I.Id = D.Id 
			   AND I.PersonId = D.PersonId
			   AND I.ImportMetadataId = D.ImportMetadataId
			   AND I.ImportMetadataId = @id

	SET @changed += @@ROWCOUNT
	
	-- INSERT the remainder
	INSERT INTO app.Import(Id, ImportMetadataId, PersonId, SourcePersonId, SourceValue, SourceModifier, ValueString, ValueNumber, ValueDate)
	SELECT
		D.Id
	  , ImportMetadataId = @id
	  , D.PersonId
	  , D.SourcePersonId
	  , D.SourceValue
	  , D.SourceModifier
	  , D.ValueString
	  , D.ValueNumber
	  , D.ValueDate
	FROM @data AS D
	WHERE NOT EXISTS (SELECT 1 
					  FROM app.Import AS I 
					  WHERE I.Id = D.Id 
						    AND I.PersonId = D.PersonId
						    AND I.ImportMetadataId = D.ImportMetadataId
						    AND I.ImportMetadataId = @id)

	SELECT Changed = @changed + @@ROWCOUNT

END

GO
