-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [auth].[ConceptConstraint]    Script Date: 4/3/19 12:21:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [auth].[ConceptConstraint](
	[ConceptId] [uniqueidentifier] NOT NULL,
	[ConstraintId] [int] NOT NULL,
	[ConstraintValue] [nvarchar](200) NOT NULL,
 CONSTRAINT [PK_ConceptConstraint_1] PRIMARY KEY CLUSTERED 
(
	[ConceptId] ASC,
	[ConstraintId] ASC,
	[ConstraintValue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [auth].[ConceptConstraint]  WITH CHECK ADD  CONSTRAINT [FK_ConceptConstraint_ConceptId] FOREIGN KEY([ConceptId])
REFERENCES [app].[Concept] ([Id])
GO
ALTER TABLE [auth].[ConceptConstraint] CHECK CONSTRAINT [FK_ConceptConstraint_ConceptId]
GO
ALTER TABLE [auth].[ConceptConstraint]  WITH CHECK ADD  CONSTRAINT [FK_ConceptConstraint_ConstraintId] FOREIGN KEY([ConstraintId])
REFERENCES [auth].[Constraint] ([Id])
GO
ALTER TABLE [auth].[ConceptConstraint] CHECK CONSTRAINT [FK_ConceptConstraint_ConstraintId]
GO
