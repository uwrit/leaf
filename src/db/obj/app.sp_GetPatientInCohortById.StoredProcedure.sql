-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetPatientInCohortById]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2022/2/9
-- Description: Retrieves a patient within a cohort by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetPatientInCohortById]
    @queryid [uniqueidentifier],
	@personid NVARCHAR(100),
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @result TABLE (
        QueryId UNIQUEIDENTIFIER NOT NULL,
        PersonId nvarchar(200) NOT NULL,
        Exported bit NOT NULL,
        Salt UNIQUEIDENTIFIER
    );

    -- if cohort not found
    IF @queryid IS NULL OR NOT EXISTS(SELECT 1 FROM app.Query WHERE Id = @queryid)
    BEGIN;
        THROW 70404, N'Query not found.', 1;
    END;

	-- Admin can access any query
	IF (@admin = 1)
		INSERT INTO @result (QueryId, PersonId, Exported, Salt)
		SELECT C.QueryId, C.PersonId, C.Exported, C.Salt
		FROM app.Cohort AS C
        WHERE C.QueryId = @queryid
              AND C.PersonId = @personid
	ELSE
		BEGIN
			-- permission filter
			WITH permitted AS (
				-- user based constraint
				SELECT
					QueryId
				FROM auth.QueryConstraint
				WHERE QueryId = @queryid
				AND ConstraintId = 1
				AND ConstraintValue = @user
				UNION
				-- group base constraint
				SELECT
					QueryId
				FROM auth.QueryConstraint
				WHERE QueryId = @queryid
				AND ConstraintId = 2
				AND ConstraintValue IN (SELECT [Group] FROM @groups)
			)
			INSERT INTO @result (QueryId, PersonId, Exported, Salt)
			SELECT C.QueryId, C.PersonId, C.Exported, C.Salt
		    FROM app.Cohort AS C
                 INNER JOIN app.Query AS Q ON C.QueryId = Q.Id
			WHERE (Q.[Owner] = @user OR Q.Id IN (SELECT Id FROM permitted))
				  AND Q.Id = @queryid
                  AND C.PersonId = @personid
				  AND C.Exported = 1
		END

    -- did not pass filter
    IF (SELECT COUNT(*) FROM @result) < 1
		BEGIN
			DECLARE @secmsg nvarchar(400) = @user + ' not permitted to query ' + CONVERT(NVARCHAR(100), @queryid) + ' or query does not exist.';
			THROW 70403, @secmsg, 1
		END;

    -- return
    SELECT QueryId, PersonId, Exported, Salt
    FROM @result;
END


GO
