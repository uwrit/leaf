-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[ConceptForwardIndex]    Script Date: 6/6/19 4:01:12 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[ConceptForwardIndex](
	[Word] [nvarchar](400) NULL,
	[WordId] [int] NOT NULL,
	[ConceptId] [uniqueidentifier] NOT NULL,
	[RootId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_ConceptForwardIndex] PRIMARY KEY CLUSTERED 
(
	[WordId] ASC,
	[ConceptId] ASC,
	[RootId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ConceptForwardIndex_ConceptId]    Script Date: 6/6/19 4:01:12 PM ******/
CREATE NONCLUSTERED INDEX [IX_ConceptForwardIndex_ConceptId] ON [app].[ConceptForwardIndex]
(
	[ConceptId] ASC
)
INCLUDE ( 	[Word]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[ConceptForwardIndex]  WITH CHECK ADD  CONSTRAINT [FK_ConceptForwardIndex_Concept] FOREIGN KEY([ConceptId])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [app].[ConceptForwardIndex] CHECK CONSTRAINT [FK_ConceptForwardIndex_Concept]
GO
ALTER TABLE [app].[ConceptForwardIndex]  WITH CHECK ADD  CONSTRAINT [FK_ConceptForwardIndex_ConceptInvertedIndex] FOREIGN KEY([WordId])
REFERENCES [app].[ConceptInvertedIndex] ([WordId])
GO
ALTER TABLE [app].[ConceptForwardIndex] CHECK CONSTRAINT [FK_ConceptForwardIndex_ConceptInvertedIndex]
GO
ALTER TABLE [app].[ConceptForwardIndex]  WITH CHECK ADD  CONSTRAINT [FK_ConceptForwardIndex_ConceptRoot] FOREIGN KEY([RootId])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [app].[ConceptForwardIndex] CHECK CONSTRAINT [FK_ConceptForwardIndex_ConceptRoot]
GO
