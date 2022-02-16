/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.11.0'
GO

/*
 * [app].[sp_GetCohortById]
 */
IF OBJECT_ID('app.sp_GetCohortById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetCohortById];
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
        WHERE (@exportedOnly = 0 OR Exported = 1)
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

/*
 * [app].[sp_GetPatientInCohortById]
 */
IF OBJECT_ID('app.sp_GetPatientInCohortById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetPatientInCohortById];
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

/*
 * [app].[sp_GetServerStateAndNotifications]
 */
IF OBJECT_ID('app.sp_GetServerStateAndNotifications', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetServerStateAndNotifications];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Gets app and db state and notifications, first deleting old notifications
-- =======================================
ALTER PROCEDURE [app].[sp_GetServerStateAndNotifications]
AS
BEGIN
    SET NOCOUNT ON

    -- Delete stale messages
    DELETE FROM app.Notification
    WHERE Until < GETDATE()

    -- Set IsUp = 1 if downtime has passed
    UPDATE app.ServerState
    SET IsUp = 1
      , DowntimeFrom    = NULL
      , DowntimeUntil   = NULL
      , DowntimeMessage = NULL
    WHERE DowntimeUntil < GETDATE()

    -- Server state
    SELECT IsUp, DowntimeMessage, DowntimeFrom, DowntimeUntil
    FROM app.ServerState

    -- Notifications
    SELECT Id, [Message]
    FROM app.Notification

    -- DB Version
    SELECT [Version]
    FROM ref.Version

END
GO















GO
