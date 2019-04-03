-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[ConceptSqlSet]    Script Date: 4/3/19 1:22:36 PM ******/
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
 CONSTRAINT [PK_ConceptSqlSet] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
