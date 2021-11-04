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
    [UpdatedBy] NVARCHAR
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

/**
 * [app].[Notification]
 */
IF OBJECT_ID('app.Notification') IS NOT NULL
	DROP TABLE [app].[Notification];
GO
CREATE TABLE [app].[Notification](
	[Id] [uniqueidentifier] NOT NULL,
    [NotificationMessage] NVARCHAR(2000) NULL,
    [NotificationUntil] DATETIME,
    [Created] DATETIME NOT NULL,
    [CreatedBy] NVARCHAR(1000) NOT NULL,
    [Updated] DATETIME NOT NULL,
    [UpdatedBy] NVARCHAR(1000) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [app].[Concept] ADD  CONSTRAINT [PK_Notification_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Updated]  DEFAULT (getdate()) FOR [Updated]
GO

/*
 * [app].[sp_GetAppState]
 */
IF OBJECT_ID('app.sp_GetAppState', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetAppState];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Gets app state
-- =======================================
CREATE PROCEDURE [app].[sp_GetAppState]
AS
BEGIN
    SET NOCOUNT ON

    SELECT IsUp, DowntimeMessage, DowntimeUntil
    FROM app.AppState

END
GO

/*
 * [adm].[sp_SetAppState]
 */
IF OBJECT_ID('adm.sp_SetAppState', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_SetAppState];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/11/2
-- Description: Sets app state
-- =======================================
CREATE PROCEDURE [adm].[sp_SetAppState]
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