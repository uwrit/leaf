-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[DatasetQuery]    Script Date: 5/28/19 1:33:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[DatasetQuery](
	[Id] [uniqueidentifier] NOT NULL,
	[UniversalId] [nvarchar](200) NULL,
	[Shape] [int] NOT NULL,
	[Name] [nvarchar](200) NOT NULL,
	[CategoryId] [int] NULL,
	[Description] [nvarchar](max) NULL,
	[SqlStatement] [nvarchar](4000) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IXUniq_DatasetQuery_Name]    Script Date: 5/28/19 1:33:44 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_DatasetQuery_Name] ON [app].[DatasetQuery]
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IXUniq_DatasetQuery_UniversalId]    Script Date: 5/28/19 1:33:44 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_DatasetQuery_UniversalId] ON [app].[DatasetQuery]
(
	[UniversalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[DatasetQuery] ADD  CONSTRAINT [DF_DatasetQuery_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[DatasetQuery] ADD  CONSTRAINT [DF_DatasetQuery_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[DatasetQuery] ADD  CONSTRAINT [DF_DatasetQuery_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
ALTER TABLE [app].[DatasetQuery]  WITH CHECK ADD  CONSTRAINT [FK_DatasetQuery_CategoryId] FOREIGN KEY([CategoryId])
REFERENCES [app].[DatasetQueryCategory] ([Id])
GO
ALTER TABLE [app].[DatasetQuery] CHECK CONSTRAINT [FK_DatasetQuery_CategoryId]
GO
ALTER TABLE [app].[DatasetQuery]  WITH CHECK ADD  CONSTRAINT [FK_DatasetQuery_Shape] FOREIGN KEY([Shape])
REFERENCES [ref].[Shape] ([Id])
GO
ALTER TABLE [app].[DatasetQuery] CHECK CONSTRAINT [FK_DatasetQuery_Shape]
GO
