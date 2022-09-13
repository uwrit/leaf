-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetCohortById]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2022/2/1
-- Description: Retrieves a cohort by Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetCohortById]
    @id [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @exportedOnly bit,
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

    -- if not found
    IF @id IS NULL
    BEGIN
        SELECT QueryId, PersonId, Exported, Salt
        FROM @result;
        RETURN;
    END;

	-- Admin can access any query
	IF (@admin = 1)
		INSERT INTO @result (QueryId, PersonId, Exported, Salt)
		SELECT C.QueryId, C.PersonId, C.Exported, C.Salt
		FROM app.Cohort AS C
        WHERE C.QueryId = @id
              AND (@exportedOnly = 0 OR Exported = 1)
	ELSE
		BEGIN
			-- permission filter
			WITH permitted AS (
				-- user based constraint
				SELECT
					QueryId
				FROM auth.QueryConstraint
				WHERE QueryId = @id
				AND ConstraintId = 1
				AND ConstraintValue = @user
				UNION
				-- group base constraint
				SELECT
					QueryId
				FROM auth.QueryConstraint
				WHERE QueryId = @id
				AND ConstraintId = 2
				AND ConstraintValue IN (SELECT [Group] FROM @groups)
			)
			INSERT INTO @result (QueryId, PersonId, Exported, Salt)
			SELECT C.QueryId, C.PersonId, C.Exported, C.Salt
		    FROM app.Cohort AS C
                 INNER JOIN app.Query AS Q ON C.QueryId = Q.Id
			WHERE (Q.[Owner] = @user OR Q.Id IN (SELECT Id FROM permitted))
				  AND Q.Id = @id
                  AND (@exportedOnly = 0 OR Exported = 1);
		END

    -- did not pass filter
    IF (SELECT COUNT(*) FROM @result) < 1
		BEGIN
			DECLARE @secmsg nvarchar(400) = @user + ' not permitted to query ' + CONVERT(NVARCHAR(100), @id);
			THROW 70403, @secmsg, 1
		END;

    -- return
    SELECT QueryId, PersonId, Exported, Salt
    FROM @result;
END


GO
