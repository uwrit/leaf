-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[Import]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[Import](
	[Id] [nvarchar](200) NOT NULL,
	[ImportMetadataId] [uniqueidentifier] NOT NULL,
	[PersonId] [nvarchar](200) NOT NULL,
	[SourcePersonId] [nvarchar](200) NOT NULL,
	[SourceModifier] [nvarchar](100) NULL,
	[SourceValue] [nvarchar](100) NOT NULL,
	[ValueString] [nvarchar](100) NULL,
	[ValueNumber] [decimal](18, 3) NULL,
	[ValueDate] [datetime] NULL,
 CONSTRAINT [PK_Import_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[ImportMetadataId] ASC,
	[PersonId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[Import]  WITH CHECK ADD  CONSTRAINT [FK_ImportConstraint_ImportMetadataId] FOREIGN KEY([ImportMetadataId])
REFERENCES [app].[ImportMetadata] ([Id])
GO
ALTER TABLE [app].[Import] CHECK CONSTRAINT [FK_ImportConstraint_ImportMetadataId]
GO
