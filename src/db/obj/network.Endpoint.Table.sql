-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [network].[Endpoint]    Script Date: 5/9/19 8:47:55 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [network].[Endpoint](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](200) NOT NULL,
	[Address] [nvarchar](1000) NOT NULL,
	[Issuer] [nvarchar](200) NOT NULL,
	[KeyId] [nvarchar](200) NOT NULL,
	[Certificate] [nvarchar](max) NOT NULL,
	[Created] [datetime] NOT NULL,
	[Updated] [datetime] NOT NULL,
	[IsInterrogator] [bit] NOT NULL,
	[IsResponder] [bit] NOT NULL,
 CONSTRAINT [PK_Endpoint] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [IX_Endpoint] UNIQUE NONCLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [IX_Endpoint_2] UNIQUE NONCLUSTERED 
(
	[KeyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Endpoint_1]    Script Date: 5/9/19 8:47:55 AM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_Endpoint_1] ON [network].[Endpoint]
(
	[Issuer] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_IsInterrogator]  DEFAULT ((0)) FOR [IsInterrogator]
GO
ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_IsResponder]  DEFAULT ((0)) FOR [IsResponder]
GO
