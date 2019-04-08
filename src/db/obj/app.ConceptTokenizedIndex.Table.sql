-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[ConceptTokenizedIndex]    Script Date: 4/8/19 1:11:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[ConceptTokenizedIndex](
	[ConceptId] [uniqueidentifier] NOT NULL,
	[JsonTokens] [nvarchar](max) NULL,
	[Updated] [datetime] NULL,
 CONSTRAINT [PK_ConceptTokenizedIndex] PRIMARY KEY CLUSTERED 
(
	[ConceptId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [app].[ConceptTokenizedIndex]  WITH CHECK ADD  CONSTRAINT [FK_ConceptTokenizedIndex_Concept] FOREIGN KEY([ConceptId])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [app].[ConceptTokenizedIndex] CHECK CONSTRAINT [FK_ConceptTokenizedIndex_Concept]
GO
