/**
 * Update version
 */
UPDATE ref.[Version]
SET [Version] = '3.10.0'
GO

/**
 * [auth].[UserRole]
 */
IF OBJECT_ID('auth.UserRole') IS NOT NULL
	DROP TABLE [auth].[UserRole];
GO

CREATE TABLE [auth].[UserRole](
	[ScopedIdentity] [nvarchar](200) NOT NULL,
    [IsUser] [bit] NOT NULL,
    [IsAdmin] [bit] NOT NULL,
    [IsSuper] [bit] NOT NULL,
    [IsIdentified] [bit] NOT NULL,
    [IsFederated] [bit] NOT NULL,
    [Created] datetime NOT NULL,
    [Updated] datetime NOT NULL
 CONSTRAINT [PK__UserRole] PRIMARY KEY CLUSTERED 
(
	[ScopedIdentity] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] 
GO

/**
 * [auth].[UserGroup]
 */
IF OBJECT_ID('auth.UserGroup') IS NOT NULL
	DROP TABLE [auth].[UserGroup];
GO

CREATE TABLE [auth].[UserGroup](
	[ScopedIdentity] [nvarchar](200) NOT NULL,
    [GroupName] [nvarchar](200) NOT NULL,
    [Created] datetime NOT NULL,
    [Updated] datetime NOT NULL
 CONSTRAINT [PK__UserGroup] PRIMARY KEY CLUSTERED 
(
	[ScopedIdentity] ASC,
    [GroupName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] 
GO

/*
 * [auth].[sp_GetUserGroupsAndRoles]
 */
IF OBJECT_ID('auth.sp_GetUserGroupsAndRoles', 'P') IS NOT NULL
    DROP PROCEDURE [auth].[sp_GetUserGroupsAndRoles];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2021/10/19
-- Description: Gets user roles
-- =======================================
CREATE PROCEDURE [auth].[sp_GetUserGroupsAndRoles]
    @scopedId nvarchar(200)
AS
BEGIN
    SET NOCOUNT ON

    -- Roles
    SELECT IsUser, IsAdmin, IsSuper, IsIdentified, IsFederated
    FROM [auth].[UserRole] AS R
    WHERE R.ScopedIdentity = @scopedId

    -- Groups
    SELECT GroupName
    FROM [auth].[UserGroup] AS G
    WHERE G.ScopedIdentity = @scopedId

END
GO