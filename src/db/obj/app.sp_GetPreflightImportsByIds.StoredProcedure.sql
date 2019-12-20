-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightImportsByIds]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/10/21
-- Description: Retrieves preflight import Ids by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetPreflightImportsByIds]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @authorized TABLE (Id uniqueIdentifier)
	DECLARE @results TABLE (Id uniqueidentifier, IsPresent bit, IsAuthorized bit)
	INSERT INTO @results (Id, IsPresent, IsAuthorized)
	SELECT 
		Id
	  , IsPresent = CASE WHEN EXISTS (SELECT 1 FROM app.ImportMetadata AS IM WHERE IM.Id = IDS.Id) THEN 1 ELSE 0 END
	  , IsAuthorized = 0
	FROM @ids AS IDS

	IF (@admin = 1)
    BEGIN;
        -- user is an admin, load all
		INSERT INTO @authorized (Id)
        SELECT IM.Id
        FROM app.ImportMetadata AS IM
		WHERE EXISTS (SELECT 1 FROM @ids AS IDS WHERE IM.ID = IDS.Id)
    END;
    ELSE
    BEGIN;
        -- user is not an admin, assess their privilege
		INSERT INTO @authorized (Id)
        SELECT IM.Id
        FROM app.ImportMetadata AS IM
        WHERE EXISTS (SELECT 1 FROM @ids AS IDS WHERE IM.ID = IDS.Id)
		AND
		(
			EXISTS (
				SELECT 1
				FROM auth.ImportMetadataConstraint AS IMC
				WHERE IMC.ImportMetadataId = IM.Id AND
				ConstraintId = 1 AND
				ConstraintValue = @user
			)
			OR EXISTS (
				SELECT 1
				FROM auth.ImportMetadataConstraint AS IMC
				WHERE IMC.ImportMetadataId = IM.Id AND
				ConstraintId = 2 AND
				ConstraintValue in (SELECT [Group] FROM @groups)
			)
			OR NOT EXISTS (
				SELECT 1
				FROM auth.ImportMetadataConstraint AS IMC
				WHERE IMC.ImportMetadataId = IM.Id
			)
		);
    END;

	UPDATE @results
	SET IsAuthorized = 1
	FROM @results AS R
	WHERE EXISTS (SELECT 1 FROM @authorized AS A WHERE R.Id = A.Id)

	SELECT *
	FROM @results

END

GO
