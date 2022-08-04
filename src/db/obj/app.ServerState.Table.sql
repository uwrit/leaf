-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  Table [app].[ServerState]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[ServerState](
	[Lock] [char](1) NOT NULL,
	[IsUp] [bit] NOT NULL,
	[DowntimeMessage] [nvarchar](2000) NULL,
	[DowntimeFrom] [datetime] NULL,
	[DowntimeUntil] [datetime] NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NULL,
 CONSTRAINT [PK_ServerState] PRIMARY KEY CLUSTERED
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[ServerState] ADD  CONSTRAINT [DF_ServerState_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [app].[ServerState]  WITH CHECK ADD  CONSTRAINT [CK_ServerState_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [app].[ServerState] CHECK CONSTRAINT [CK_ServerState_1]
GO
