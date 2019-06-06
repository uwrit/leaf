-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[Cohort]    Script Date: 6/6/19 11:15:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[Cohort](
	[QueryId] [uniqueidentifier] NOT NULL,
	[PersonId] [nvarchar](200) NOT NULL,
	[Exported] [bit] NOT NULL,
	[Salt] [uniqueidentifier] NULL
) ON [PRIMARY]
GO
/****** Object:  Index [IX_Cohort_QueryId]    Script Date: 6/6/19 11:15:59 AM ******/
CREATE CLUSTERED INDEX [IX_Cohort_QueryId] ON [app].[Cohort]
(
	[QueryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[Cohort]  WITH NOCHECK ADD  CONSTRAINT [FK_Cohort_QueryId] FOREIGN KEY([QueryId])
REFERENCES [app].[Query] ([Id])
GO
ALTER TABLE [app].[Cohort] CHECK CONSTRAINT [FK_Cohort_QueryId]
GO
