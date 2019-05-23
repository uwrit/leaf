-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[Concept]    Script Date: 5/23/19 3:52:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[Concept](
	[Id] [uniqueidentifier] NOT NULL,
	[ParentId] [uniqueidentifier] NULL,
	[RootId] [uniqueidentifier] NULL,
	[ExternalId] [nvarchar](200) NULL,
	[ExternalParentId] [nvarchar](200) NULL,
	[UniversalId] [nvarchar](200) NULL,
	[IsPatientCountAutoCalculated] [bit] NULL,
	[IsNumeric] [bit] NULL,
	[IsParent] [bit] NULL,
	[IsRoot] [bit] NULL,
	[IsSpecializable] [bit] NULL,
	[SqlSetId] [int] NULL,
	[SqlSetWhere] [nvarchar](1000) NULL,
	[SqlFieldNumeric] [nvarchar](1000) NULL,
	[UiDisplayName] [nvarchar](400) NULL,
	[UiDisplayText] [nvarchar](1000) NULL,
	[UiDisplaySubtext] [nvarchar](100) NULL,
	[UiDisplayUnits] [nvarchar](50) NULL,
	[UiDisplayTooltip] [nvarchar](max) NULL,
	[UiDisplayPatientCount] [int] NULL,
	[UiDisplayPatientCountByYear] [nvarchar](max) NULL,
	[UiDisplayRowOrder] [int] NULL,
	[UiNumericDefaultText] [nvarchar](50) NULL,
	[AddDateTime] [datetime] NULL,
	[PatientCountLastUpdateDateTime] [datetime] NULL,
	[ContentLastUpdateDateTime] [datetime] NULL,
 CONSTRAINT [PK_Concept_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Index [IX_ParentId]    Script Date: 5/23/19 3:52:48 PM ******/
CREATE NONCLUSTERED INDEX [IX_ParentId] ON [app].[Concept]
(
	[ParentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IXUniq_Concept_UniversalId]    Script Date: 5/23/19 3:52:48 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_Concept_UniversalId] ON [app].[Concept]
(
	[UniversalId] ASC
)
WHERE ([UniversalId] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[Concept] ADD  CONSTRAINT [DF_Concept_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[Concept] ADD  CONSTRAINT [DF_Concept_AddDateTime]  DEFAULT (getdate()) FOR [AddDateTime]
GO
ALTER TABLE [app].[Concept]  WITH CHECK ADD  CONSTRAINT [FK_Concept_SqlSetId] FOREIGN KEY([SqlSetId])
REFERENCES [app].[ConceptSqlSet] ([Id])
GO
ALTER TABLE [app].[Concept] CHECK CONSTRAINT [FK_Concept_SqlSetId]
GO
