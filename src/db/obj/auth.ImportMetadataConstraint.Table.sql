-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [auth].[ImportMetadataConstraint]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [auth].[ImportMetadataConstraint](
	[ImportMetadataId] [uniqueidentifier] NOT NULL,
	[ConstraintId] [int] NOT NULL,
	[ConstraintValue] [nvarchar](1000) NOT NULL,
 CONSTRAINT [PK_ImportMetadataConstraint] PRIMARY KEY CLUSTERED 
(
	[ImportMetadataId] ASC,
	[ConstraintId] ASC,
	[ConstraintValue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [auth].[ImportMetadataConstraint]  WITH CHECK ADD  CONSTRAINT [FK_ImportMetadataConstraint_ConstraintId] FOREIGN KEY([ConstraintId])
REFERENCES [auth].[Constraint] ([Id])
GO
ALTER TABLE [auth].[ImportMetadataConstraint] CHECK CONSTRAINT [FK_ImportMetadataConstraint_ConstraintId]
GO
ALTER TABLE [auth].[ImportMetadataConstraint]  WITH CHECK ADD  CONSTRAINT [FK_ImportMetadataConstraint_ImportMetadataId] FOREIGN KEY([ImportMetadataId])
REFERENCES [app].[ImportMetadata] ([Id])
GO
ALTER TABLE [auth].[ImportMetadataConstraint] CHECK CONSTRAINT [FK_ImportMetadataConstraint_ImportMetadataId]
GO
