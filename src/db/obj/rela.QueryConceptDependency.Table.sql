-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [rela].[QueryConceptDependency]    Script Date: 5/9/19 8:47:55 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [rela].[QueryConceptDependency](
	[QueryId] [uniqueidentifier] NOT NULL,
	[DependsOn] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_QueryConceptDependency_1] PRIMARY KEY CLUSTERED 
(
	[QueryId] ASC,
	[DependsOn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [rela].[QueryConceptDependency]  WITH CHECK ADD  CONSTRAINT [FK_QueryConceptDependency_DependsOn] FOREIGN KEY([DependsOn])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [rela].[QueryConceptDependency] CHECK CONSTRAINT [FK_QueryConceptDependency_DependsOn]
GO
ALTER TABLE [rela].[QueryConceptDependency]  WITH CHECK ADD  CONSTRAINT [FK_QueryConceptDependency_QueryId] FOREIGN KEY([QueryId])
REFERENCES [app].[Query] ([Id])
GO
ALTER TABLE [rela].[QueryConceptDependency] CHECK CONSTRAINT [FK_QueryConceptDependency_QueryId]
GO
