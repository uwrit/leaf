USE [LeafDB]
GO
/****** Object:  Table [app].[GlobalPanelFilter]    Script Date: 8/26/2019 2:06:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[GlobalPanelFilter](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[AccessModeId] [int] NULL,
	[SqlSetId] [int] NOT NULL,
	[SqlSetWhere] [nvarchar](1000) NULL,
 CONSTRAINT [PK_GlobalPanelFilter] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [ref].[AccessMode]    Script Date: 8/26/2019 2:06:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [ref].[AccessMode](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_AccessMode] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [ref].[AccessMode] ([Id], [Name]) VALUES (1, N'QI')
GO
INSERT [ref].[AccessMode] ([Id], [Name]) VALUES (2, N'Research')
GO
ALTER TABLE [app].[GlobalPanelFilter]  WITH CHECK ADD  CONSTRAINT [FK_GlobalPanelFilter_AccessModeId] FOREIGN KEY([AccessModeId])
REFERENCES [ref].[AccessMode] ([Id])
GO
ALTER TABLE [app].[GlobalPanelFilter] CHECK CONSTRAINT [FK_GlobalPanelFilter_AccessModeId]
GO
ALTER TABLE [app].[GlobalPanelFilter]  WITH CHECK ADD  CONSTRAINT [FK_GlobalPanelFilter_ConceptSqlSetId] FOREIGN KEY([SqlSetId])
REFERENCES [app].[ConceptSqlSet] ([Id])
GO
ALTER TABLE [app].[GlobalPanelFilter] CHECK CONSTRAINT [FK_GlobalPanelFilter_ConceptSqlSetId]
GO

/****** Object:  UserDefinedDataType [auth].[AccessMode]  Script Date: 8/26/2019 2:07:52 PM ******/
CREATE TYPE [app].[AccessMode] FROM [int] NOT NULL
GO

/*
 * Update Panel Filter columns
 */

-- Created
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'Created' AND Object_ID = Object_ID(N'app.PanelFilter'))
	BEGIN
		ALTER TABLE app.PanelFilter
		ADD Created DATETIME NOT NULL CONSTRAINT [DF_PanelFilter_Created] DEFAULT GETDATE()
	END

-- CreatedBy
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'app.PanelFilter'))
	BEGIN
		ALTER TABLE app.PanelFilter
		ADD CreatedBy NVARCHAR(1000) NOT NULL CONSTRAINT TEMP_DEF1 DEFAULT 'leaf_3.4.0_migration'
		
		ALTER TABLE app.PanelFilter DROP CONSTRAINT TEMP_DEF1
	END

-- Updated
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'Updated' AND Object_ID = Object_ID(N'app.PanelFilter'))
	BEGIN
		ALTER TABLE app.PanelFilter
		ADD Updated DATETIME NOT NULL CONSTRAINT [DF_PanelFilter_Updated] DEFAULT GETDATE()
	END

-- UpdatedBy
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'UpdatedBy' AND Object_ID = Object_ID(N'app.PanelFilter'))
	BEGIN
		ALTER TABLE app.PanelFilter
		ADD UpdatedBy NVARCHAR(1000) NOT NULL CONSTRAINT TEMP_DEF1 DEFAULT 'leaf_3.4.0_migration'

		ALTER TABLE app.PanelFilter DROP CONSTRAINT TEMP_DEF1
	END

-- Constraints
IF OBJECT_ID('app.DF_PanelFilter_LastChanged') IS NOT NULL 
    ALTER TABLE app.PanelFilter DROP CONSTRAINT DF_PanelFilter_LastChanged

-- LastChanged
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'LastChanged' AND Object_ID = Object_ID(N'app.PanelFilter'))
	BEGIN
		ALTER TABLE app.PanelFilter
		DROP COLUMN LastChanged
	END

-- ChangedBy
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'ChangedBy' AND Object_ID = Object_ID(N'app.PanelFilter'))
	BEGIN
		ALTER TABLE app.PanelFilter
		DROP COLUMN ChangedBy
	END


/*
 * TODO: Add stored procedures.
 */
-- adm.sp_CreatePanelFilter
-- adm.sp_CreateGlobalPanelFilter
-- adm.sp_UpdatePanelFilter
-- adm.sp_UpdateGlobalPanelFilter
-- adm.sp_DeletePanelFilter
-- adm.sp_DeleteGlobalPanelFilter
-- adm.sp_GetPanelFilters
-- adm.sp_GetGlobalPanelFilters