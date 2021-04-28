-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[DynamicDatasetQuery]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[DynamicDatasetQuery](
	[Id] [uniqueidentifier] NOT NULL,
	[SqlFieldDate] [nvarchar](1000) NULL,
	[SqlFieldValueString] [nvarchar](1000) NULL,
	[SqlFieldValueNumeric] [nvarchar](1000) NULL,
	[Schema] [nvarchar](max) NOT NULL,
	[IsEncounterBased] [bit] NOT NULL,
 CONSTRAINT [PK__DynamicDatasetQuery] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [app].[DynamicDatasetQuery]  WITH CHECK ADD  CONSTRAINT [FK_DynamicDatasetQuery_Id] FOREIGN KEY([Id])
REFERENCES [app].[DatasetQuery] ([Id])
GO
ALTER TABLE [app].[DynamicDatasetQuery] CHECK CONSTRAINT [FK_DynamicDatasetQuery_Id]
GO
