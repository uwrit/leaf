-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[DemographicQuery]    Script Date: 6/12/19 9:23:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[DemographicQuery](
	[Lock] [char](1) NOT NULL,
	[SqlStatement] [nvarchar](4000) NOT NULL,
	[Shape] [int] NOT NULL,
	[LastChanged] [datetime] NOT NULL,
	[ChangedBy] [nvarchar](1000) NOT NULL,
 CONSTRAINT [PK_DemographicQuery] PRIMARY KEY CLUSTERED 
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[DemographicQuery] ADD  CONSTRAINT [DF_DemographicQuery_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [app].[DemographicQuery]  WITH CHECK ADD  CONSTRAINT [FK_DemographicQuery_Shape] FOREIGN KEY([Shape])
REFERENCES [ref].[Shape] ([Id])
GO
ALTER TABLE [app].[DemographicQuery] CHECK CONSTRAINT [FK_DemographicQuery_Shape]
GO
ALTER TABLE [app].[DemographicQuery]  WITH CHECK ADD  CONSTRAINT [CK_DemographicQuery_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [app].[DemographicQuery] CHECK CONSTRAINT [CK_DemographicQuery_1]
GO
