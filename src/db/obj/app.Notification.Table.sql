-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[Notification]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[Notification](
	[Id] [uniqueidentifier] NOT NULL,
	[Message] [nvarchar](2000) NULL,
	[Until] [datetime] NULL,
	[Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL,
 CONSTRAINT [PK_Notification_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[Notification] ADD  CONSTRAINT [DF_Notification_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
