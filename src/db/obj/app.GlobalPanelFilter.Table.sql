-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[GlobalPanelFilter]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[GlobalPanelFilter](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsInclusion] [bit] NOT NULL,
	[SessionType] [int] NULL,
	[SqlSetId] [int] NOT NULL,
	[SqlSetWhere] [nvarchar](1000) NULL,
	[Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](200) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](200) NOT NULL,
 CONSTRAINT [PK_GlobalPanelFilter] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[GlobalPanelFilter]  WITH CHECK ADD  CONSTRAINT [FK_GlobalPanelFilter_ConceptSqlSetId] FOREIGN KEY([SqlSetId])
REFERENCES [app].[ConceptSqlSet] ([Id])
GO
ALTER TABLE [app].[GlobalPanelFilter] CHECK CONSTRAINT [FK_GlobalPanelFilter_ConceptSqlSetId]
GO
ALTER TABLE [app].[GlobalPanelFilter]  WITH CHECK ADD  CONSTRAINT [FK_GlobalPanelFilter_SessionType] FOREIGN KEY([SessionType])
REFERENCES [ref].[SessionType] ([Id])
GO
ALTER TABLE [app].[GlobalPanelFilter] CHECK CONSTRAINT [FK_GlobalPanelFilter_SessionType]
GO
