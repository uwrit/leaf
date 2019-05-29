-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [rela].[ConceptSpecializationGroup]    Script Date: 5/29/19 9:58:40 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [rela].[ConceptSpecializationGroup](
	[ConceptId] [uniqueidentifier] NOT NULL,
	[SpecializationGroupId] [int] NOT NULL,
	[OrderId] [int] NULL,
 CONSTRAINT [PK_ConceptSpecializationGroup] PRIMARY KEY CLUSTERED 
(
	[ConceptId] ASC,
	[SpecializationGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [rela].[ConceptSpecializationGroup]  WITH CHECK ADD  CONSTRAINT [FK_ConceptSpecializationGroup_Concept] FOREIGN KEY([ConceptId])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [rela].[ConceptSpecializationGroup] CHECK CONSTRAINT [FK_ConceptSpecializationGroup_Concept]
GO
ALTER TABLE [rela].[ConceptSpecializationGroup]  WITH CHECK ADD  CONSTRAINT [FK_ConceptSpecializationGroup_SpecializationGroup] FOREIGN KEY([SpecializationGroupId])
REFERENCES [app].[SpecializationGroup] ([Id])
GO
ALTER TABLE [rela].[ConceptSpecializationGroup] CHECK CONSTRAINT [FK_ConceptSpecializationGroup_SpecializationGroup]
GO
