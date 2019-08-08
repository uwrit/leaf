-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[DatasetQueryTag]    Script Date: 8/8/2019 3:56:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[DatasetQueryTag](
	[DatasetQueryId] [uniqueidentifier] NOT NULL,
	[Tag] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_DatasetQueryTag] PRIMARY KEY CLUSTERED 
(
	[DatasetQueryId] ASC,
	[Tag] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[DatasetQueryTag]  WITH CHECK ADD  CONSTRAINT [FK_DatasetQueryTag_DatasetQueryId] FOREIGN KEY([DatasetQueryId])
REFERENCES [app].[DatasetQuery] ([Id])
GO
ALTER TABLE [app].[DatasetQueryTag] CHECK CONSTRAINT [FK_DatasetQueryTag_DatasetQueryId]
GO
