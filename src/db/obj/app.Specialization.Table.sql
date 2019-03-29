-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[Specialization]    Script Date: 3/29/19 11:06:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[Specialization](
	[Id] [uniqueidentifier] NOT NULL,
	[SpecializationGroupId] [int] NOT NULL,
	[UniversalId] [nvarchar](200) NULL,
	[UiDisplayText] [nvarchar](100) NOT NULL,
	[SqlSetWhere] [nvarchar](1000) NOT NULL,
	[OrderId] [int] NULL,
 CONSTRAINT [PK_Specialization] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[Specialization] ADD  CONSTRAINT [DF__ConceptSpecialization__Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[Specialization]  WITH CHECK ADD  CONSTRAINT [FK_Specialization_SpecializationGroup] FOREIGN KEY([SpecializationGroupId])
REFERENCES [app].[SpecializationGroup] ([Id])
GO
ALTER TABLE [app].[Specialization] CHECK CONSTRAINT [FK_Specialization_SpecializationGroup]
GO
