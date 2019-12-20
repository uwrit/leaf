-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_CreateImportMetadata]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Creates an Import Metadata record.
-- =======================================
CREATE PROCEDURE [app].[sp_CreateImportMetadata]
    @user auth.[User],
	@constraints auth.ResourceConstraintTable READONLY,
	@sourceId nvarchar(100),
	@type int,
	@structure nvarchar(max)
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

	DECLARE @created TABLE (Id uniqueidentifier, SourceId nvarchar(100), Structure nvarchar(max), [Type] int, Created datetime, Updated datetime);
	DECLARE @cons TABLE (ImportMetadataId uniqueidentifier, ConstraintId int, ConstraintValue nvarchar(100));

	-- INSERT metadata row
	INSERT INTO app.ImportMetadata (SourceId, [Type], Structure, Created, CreatedBy, Updated, UpdatedBy)
	OUTPUT inserted.Id, inserted.SourceId, inserted.Structure, inserted.[Type], inserted.Created, inserted.Updated INTO @created
	VALUES (@sourceId, @type, @structure, GETDATE(), @user, GETDATE(), @user);

	DECLARE @id uniqueidentifier = (SELECT TOP 1 Id FROM @created);

	-- INSERT contraints
	INSERT INTO auth.ImportMetadataConstraint (ImportMetadataId, ConstraintId, ConstraintValue)
	OUTPUT inserted.ImportMetadataId, inserted.ConstraintId, inserted.ConstraintValue INTO @cons
	SELECT
		ImportMetadataId = @id
	  , C.ConstraintId
	  , C.ConstraintValue
	FROM @constraints AS C;

	SELECT * FROM @created;
	SELECT * FROM @cons;

END

GO
