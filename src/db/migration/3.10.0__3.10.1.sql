/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.10.1'
GO

/**
 * [app].[AppState]
 */
IF OBJECT_ID('app.AppState') IS NOT NULL
	DROP TABLE [app].[AppState];
GO

CREATE TABLE [app].[AppState](
	[Lock] [char](1) NOT NULL,
    [IsUp] BIT NOT NULL,
    [DowntimeMessage] NVARCHAR(2000) NULL,
    [DowntimeUntil] DATETIME NULL,
    [Updated] DATETIME NOT NULL,
    [UpdatedBy] NVARCHAR(1000)
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
ALTER TABLE [app].[AppState] ADD  CONSTRAINT [PK_AppState] PRIMARY KEY CLUSTERED 
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[AppState] ADD  CONSTRAINT [DF_AppState_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [app].[AppState]  WITH CHECK ADD  CONSTRAINT [CK_AppState_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [app].[AppState] CHECK CONSTRAINT [CK_AppState_1]
GO

INSERT INTO app.AppState (Lock, IsUp, Updated, UpdatedBy)
SELECT 'X', 1, GETDATE(), 'Leaf Migration Script'


/**
 * [app].[Notification]
 */
IF OBJECT_ID('app.Notification') IS NOT NULL
	DROP TABLE [app].[Notification];
GO
CREATE TABLE [app].[Notification](
	[Id] [uniqueidentifier] NOT NULL,
    [Message] NVARCHAR(2000) NULL,
    [Until] DATETIME,
    [Created] DATETIME NOT NULL,
    [CreatedBy] NVARCHAR(1000) NOT NULL,
    [Updated] DATETIME NOT NULL,
    [UpdatedBy] NVARCHAR(1000) NOT NULL
)
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [PK_Notification_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO

/*
 * [app].[sp_GetAppStateAndNotifications]
 */
IF OBJECT_ID('app.sp_GetAppStateAndNotifications', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetAppStateAndNotifications];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Gets app state and notifications, first deleting old notifications
-- =======================================
CREATE PROCEDURE [app].[sp_GetAppStateAndNotifications]
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM app.Notification
    WHERE Until < GETDATE()

    -- App state
    SELECT IsUp, DowntimeMessage, DowntimeUntil
    FROM app.AppState

    -- Notifications
    SELECT Id, [Message]
    FROM app.Notification

END
GO

/*
 * [adm].[sp_GetAppState]
 */
IF OBJECT_ID('adm.sp_GetAppState', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetAppState];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Gets app state
-- =======================================
CREATE PROCEDURE [adm].[sp_GetAppState]
AS
BEGIN
    SET NOCOUNT ON

    SELECT IsUp, DowntimeMessage, DowntimeUntil, Updated, UpdatedBy
    FROM app.AppState

END
GO

/*
 * [adm].[sp_UpdateAppState]
 */
IF OBJECT_ID('adm.sp_UpdateAppState', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateAppState];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Sets app state
-- =======================================
CREATE PROCEDURE [adm].[sp_UpdateAppState]
    @user NVARCHAR(100),
    @isUp BIT,
    @downtimeMessage NVARCHAR(2000),
    @downtimeUntil DATETIME
AS
BEGIN
    SET NOCOUNT ON

    UPDATE app.AppState
    SET IsUp = @isUp
      , DowntimeMessage = @downtimeMessage
      , DowntimeUntil = @downtimeUntil
      , Updated = GETDATE()
      , UpdatedBy = @user

END
GO

/*
 * [adm].[sp_GetUserNotifications]
 */
IF OBJECT_ID('adm.sp_GetUserNotifications', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_GetUserNotifications];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Gets user notifications
-- =======================================
CREATE PROCEDURE [adm].[sp_GetUserNotifications]
AS
BEGIN
    SET NOCOUNT ON

    SELECT Id, [Message], Until, Created, CreatedBy, Updated, UpdatedBy
    FROM app.Notification

END
GO

/*
 * [adm].[sp_UpsertNotification]
 */
IF OBJECT_ID('adm.sp_UpsertNotification', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpsertNotification];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/5
-- Description: Updates or inserts a notification
-- =======================================
CREATE PROCEDURE [adm].[sp_UpsertNotification]
    @user NVARCHAR(100),
    @id UNIQUEIDENTIFIER = NULL,
    @message NVARCHAR(2000),
    @until DATETIME
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @upserted TABLE ([Id] [uniqueidentifier], [Message] NVARCHAR(2000), [Until] DATETIME, [Created] DATETIME , [CreatedBy] NVARCHAR(1000), [Updated] DATETIME , [UpdatedBy] NVARCHAR(1000))

    IF @id IS NULL
    BEGIN
        INSERT INTO app.Notification ([Message], Until, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT inserted.Id, inserted.Message, inserted.Until, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy INTO @upserted
        SELECT @message, @until, GETDATE(), @user, GETDATE(), @user
    END

    ELSE
    BEGIN
        UPDATE app.Notification
        SET [Message] = @message
          , Until = @until
          , Updated = GETDATE()
          , UpdatedBy = @user
        OUTPUT inserted.Id, inserted.Message, inserted.Until, inserted.Created, inserted.CreatedBy, inserted.Updated, inserted.UpdatedBy INTO @upserted
        WHERE Id = @id
    END

    SELECT * FROM @upserted

END
GO

/*
 * [adm].[sp_DeleteNotification]
 */
IF OBJECT_ID('adm.sp_DeleteNotification', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_DeleteNotification];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/5
-- Description: Deletes a notification
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteNotification]
    @id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @deleted TABLE ([Id] [uniqueidentifier], [Message] NVARCHAR(2000), [Until] DATETIME, [Created] DATETIME , [CreatedBy] NVARCHAR(1000), [Updated] DATETIME , [UpdatedBy] NVARCHAR(1000))

    IF NOT EXISTS(SELECT 1 FROM app.Notification WHERE Id = @id)
        BEGIN;
            THROW 70404, N'Notification not found.', 1;
        END;

    DELETE FROM app.Notification
    OUTPUT deleted.Id, deleted.Message, deleted.Until, deleted.Created, deleted.CreatedBy, deleted.Updated, deleted.UpdatedBy INTO @deleted
    WHERE Id = @id

    SELECT * FROM @deleted

END
GO

/**
 * Rename [auth].[TokenBlacklist] -> [auth].[InvalidatedToken]
 */
IF OBJECT_ID('auth.TokenBlacklist') IS NOT NULL
	EXEC sp_rename 'auth.TokenBlacklist', 'InvalidatedToken'
GO

/*
 * [auth].[sp_BlacklistToken]
 */
IF OBJECT_ID('auth.sp_BlacklistToken', 'P') IS NOT NULL
    DROP PROCEDURE [auth].[sp_BlacklistToken];
GO

/*
 * [auth].[sp_InvalidateToken]
 */
IF OBJECT_ID('auth.sp_InvalidateToken', 'P') IS NOT NULL
    DROP PROCEDURE [auth].[sp_InvalidateToken];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/9
-- Description: Invalidates a token
-- =======================================
CREATE PROCEDURE [auth].[sp_InvalidateToken]
    @idNonce UNIQUEIDENTIFIER,
    @exp datetime
AS
BEGIN
    SET NOCOUNT ON

    INSERT INTO auth.InvalidatedToken
    VALUES (@idNonce, @exp);
END
GO

/*
 * [auth].[sp_RefreshTokenBlacklist]
 */
IF OBJECT_ID('auth.sp_RefreshTokenBlacklist', 'P') IS NOT NULL
    DROP PROCEDURE [auth].[sp_RefreshTokenBlacklist];
GO

/*
 * [auth].[sp_RefreshInvalidatedTokenList]
 */
IF OBJECT_ID('auth.sp_RefreshInvalidatedTokenList', 'P') IS NOT NULL
    DROP PROCEDURE [auth].[sp_RefreshInvalidatedTokenList];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/9
-- Description: Clears expired tokens, and returns remainder.
-- =======================================
CREATE PROCEDURE [auth].[sp_RefreshInvalidatedTokenList]
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM auth.InvalidatedToken
    WHERE Expires < GETDATE();

    SELECT IdNonce, Expires
    FROM auth.InvalidatedToken;
END
GO