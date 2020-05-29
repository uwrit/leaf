-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_DeleteImportMetadata]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Deletes an Import Metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_DeleteImportMetadata]
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
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to to delete import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	DECLARE @deleted TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100))

	-- DELETE any constraints
	DELETE auth.ImportMetadataConstraint
	OUTPUT deleted.ImportMetadataId, deleted.ConstraintId, deleted.ConstraintValue INTO @cons
	WHERE ImportMetadataId = @id;

	-- DELETE any imported data
	DELETE app.Import
	WHERE ImportMetadataId = @id

	-- DELETE metadata
	DELETE app.ImportMetadata
	OUTPUT deleted.Id, deleted.SourceId, deleted.Structure, deleted.[Type] INTO @deleted
	WHERE Id = @id;

	SELECT * FROM @deleted;
	SELECT * FROM @cons;

END

GO
