-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetImportMetadata]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves all Import Metadata depending on user and groups.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportMetadata]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @requested app.ResourceIdTable;

	INSERT INTO @requested
	SELECT Id
	FROM app.ImportMetadata;

	DECLARE @ids TABLE (Id uniqueidentifier)

	IF (@admin = 1)
    BEGIN;
        -- user is an admin, load them all
        INSERT INTO @ids
        SELECT IM.Id
        FROM app.ImportMetadata AS IM
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
        INSERT INTO @ids (Id)
        SELECT
            IM.Id
        FROM app.ImportMetadata AS IM
        WHERE EXISTS (
            SELECT 1
            FROM auth.ImportMetadataConstraint
            WHERE ImportMetadataId = IM.Id AND
            ConstraintId = 1 AND
            ConstraintValue = @user
        )
        OR EXISTS (
            SELECT 1
            FROM auth.ImportMetadataConstraint
            WHERE ImportMetadataId = IM.Id AND
            ConstraintId = 2 AND
            ConstraintValue in (SELECT [Group] FROM @groups)
        )
        OR NOT EXISTS (
            SELECT 1
            FROM auth.ImportMetadataConstraint
            WHERE ImportMetadataId = IM.Id
        );
    END;

	SELECT 
		Id
	  , SourceId
	  , Structure
	  , [Type]
	  , Created
	  , Updated
	FROM app.ImportMetadata AS IM
	WHERE EXISTS (SELECT 1 FROM @ids AS I WHERE I.Id = IM.Id)

	SELECT
		ImportMetadataId
	  , ConstraintId
	  , ConstraintValue
	FROM auth.ImportMetadataConstraint AS IMC
	WHERE EXISTS (SELECT 1 FROM @ids AS I WHERE I.Id = IMC.ImportMetadataId);

END

GO
