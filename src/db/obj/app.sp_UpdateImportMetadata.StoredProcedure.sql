-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_UpdateImportMetadata]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Updates an Import Metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_UpdateImportMetadata]
	@id uniqueidentifier,
	@sourceId nvarchar(100),
	@type int,
	@structure nvarchar(max),
	@constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User],
	@groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	IF (NOT EXISTS (SELECT 1 FROM ref.ImportType AS IT WHERE @type = IT.Id))
    BEGIN;
        THROW 70404, N'ImportType does not exist.', 1;
    END;

	IF (app.fn_NullOrWhitespace(@sourceId) = 1)
        THROW 70400, N'SourceId is required.', 1;

	IF (app.fn_NullOrWhitespace(@structure) = 1)
        THROW 70400, N'Structure is required.', 1;

	DECLARE @authorized BIT = [auth].[fn_UserIsAuthorizedForImportMetadataById](@user, @groups, @id, @admin)

	IF @authorized = 0
	BEGIN;
		DECLARE @403msg1 nvarchar(400) = @user + N' is not allowed to to alter import ' + CONVERT(NVARCHAR(100),@id);
        THROW 70403, @403msg1, 1;
	END;

	DECLARE @updated TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int, Created datetime, Updated datetime);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100))

	-- INSERT metadata row
	UPDATE TOP (1) app.ImportMetadata 
	SET 
		SourceId = @sourceId
	  , [Type] = @type
	  , Structure = @structure
	  , Updated = GETDATE()
	  , UpdatedBy = @user
	OUTPUT inserted.Id, inserted.SourceId, inserted.Structure, inserted.[Type], inserted.Created, inserted.Updated INTO @updated
	WHERE Id = @id;

	-- DELETE any previous constraints
	DELETE auth.ImportMetadataConstraint
	WHERE ImportMetadataId = @id;

	-- INSERT contraints
	INSERT INTO auth.ImportMetadataConstraint (ImportMetadataId, ConstraintId, ConstraintValue)
	OUTPUT inserted.ImportMetadataId, inserted.ConstraintId, inserted.ConstraintValue INTO @cons
	SELECT
		ImportMetadataId = @id
	  , C.ConstraintId
	  , C.ConstraintValue
	FROM @constraints AS C;

	SELECT * FROM @updated;
	SELECT * FROM @cons;

END

GO
