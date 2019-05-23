-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [auth].[QueryConstraint]    Script Date: 5/23/19 3:52:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [auth].[QueryConstraint](
	[QueryId] [uniqueidentifier] NOT NULL,
	[ConstraintId] [int] NOT NULL,
	[ConstraintValue] [nvarchar](1000) NOT NULL,
 CONSTRAINT [PK_QueryConstraint_1] PRIMARY KEY CLUSTERED 
(
	[QueryId] ASC,
	[ConstraintId] ASC,
	[ConstraintValue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [auth].[QueryConstraint]  WITH CHECK ADD  CONSTRAINT [FK_QueryConstraint_ConstraintId] FOREIGN KEY([ConstraintId])
REFERENCES [auth].[Constraint] ([Id])
GO
ALTER TABLE [auth].[QueryConstraint] CHECK CONSTRAINT [FK_QueryConstraint_ConstraintId]
GO
ALTER TABLE [auth].[QueryConstraint]  WITH CHECK ADD  CONSTRAINT [FK_QueryConstraint_QueryId] FOREIGN KEY([QueryId])
REFERENCES [app].[Query] ([Id])
GO
ALTER TABLE [auth].[QueryConstraint] CHECK CONSTRAINT [FK_QueryConstraint_QueryId]
GO
