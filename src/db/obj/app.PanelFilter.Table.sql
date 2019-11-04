-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[PanelFilter]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[PanelFilter](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ConceptId] [uniqueidentifier] NOT NULL,
	[IsInclusion] [bit] NOT NULL,
	[UiDisplayText] [nvarchar](1000) NULL,
	[UiDisplayDescription] [nvarchar](4000) NULL,
	[Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[PanelFilter] ADD  CONSTRAINT [DF_PanelFilter_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[PanelFilter] ADD  CONSTRAINT [DF_PanelFilter_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
ALTER TABLE [app].[PanelFilter]  WITH CHECK ADD  CONSTRAINT [FK_PanelFilter_ConceptId] FOREIGN KEY([ConceptId])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [app].[PanelFilter] CHECK CONSTRAINT [FK_PanelFilter_ConceptId]
GO
