-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[ConceptSqlSet]    Script Date: 4/8/19 1:11:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[ConceptSqlSet](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsEncounterBased] [bit] NULL,
	[IsEventBased] [bit] NULL,
	[SqlSetFrom] [nvarchar](1000) NOT NULL,
	[SqlFieldDate] [nvarchar](1000) NULL,
	[SqlFieldEventId] [nvarchar](400) NULL,
	[Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](200) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](200) NOT NULL,
	[SqlEventId] [int] NULL,
 CONSTRAINT [PK_ConceptSqlSet] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[ConceptSqlSet]  WITH CHECK ADD  CONSTRAINT [FK_SqlEventId] FOREIGN KEY([SqlEventId])
REFERENCES [app].[ConceptSqlEvent] ([Id])
GO
ALTER TABLE [app].[ConceptSqlSet] CHECK CONSTRAINT [FK_SqlEventId]
GO
