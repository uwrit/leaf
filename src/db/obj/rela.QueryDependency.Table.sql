-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [rela].[QueryDependency]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [rela].[QueryDependency](
	[QueryId] [uniqueidentifier] NOT NULL,
	[DependsOn] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_QueryDependency_1] PRIMARY KEY CLUSTERED 
(
	[QueryId] ASC,
	[DependsOn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [rela].[QueryDependency]  WITH CHECK ADD  CONSTRAINT [FK_QueryDependency_DependsOn] FOREIGN KEY([DependsOn])
REFERENCES [app].[Query] ([Id])
GO
ALTER TABLE [rela].[QueryDependency] CHECK CONSTRAINT [FK_QueryDependency_DependsOn]
GO
ALTER TABLE [rela].[QueryDependency]  WITH CHECK ADD  CONSTRAINT [FK_QueryDependency_QueryId] FOREIGN KEY([QueryId])
REFERENCES [app].[Query] ([Id])
GO
ALTER TABLE [rela].[QueryDependency] CHECK CONSTRAINT [FK_QueryDependency_QueryId]
GO
