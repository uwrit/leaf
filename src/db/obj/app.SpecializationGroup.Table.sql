-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[SpecializationGroup]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[SpecializationGroup](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SqlSetId] [int] NOT NULL,
	[UiDefaultText] [nvarchar](100) NOT NULL,
	[LastChanged] [datetime] NULL,
	[ChangedBy] [nvarchar](1000) NULL,
 CONSTRAINT [PK_SpecializationGroup] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[SpecializationGroup]  WITH CHECK ADD  CONSTRAINT [FK_SpecializationGroup_ConceptSqlSet] FOREIGN KEY([SqlSetId])
REFERENCES [app].[ConceptSqlSet] ([Id])
GO
ALTER TABLE [app].[SpecializationGroup] CHECK CONSTRAINT [FK_SpecializationGroup_ConceptSqlSet]
GO
