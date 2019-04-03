-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[Query]    Script Date: 4/3/19 1:22:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[Query](
	[Id] [uniqueidentifier] NOT NULL,
	[Pepper] [uniqueidentifier] NOT NULL,
	[Nonce] [uniqueidentifier] NULL,
	[Owner] [nvarchar](200) NOT NULL,
	[Created] [datetime] NOT NULL,
	[UniversalId] [nvarchar](200) NULL,
	[Name] [nvarchar](200) NULL,
	[Category] [nvarchar](200) NULL,
	[Updated] [datetime] NOT NULL,
	[Ver] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [IX_Query_Nonce]    Script Date: 4/3/19 1:22:36 PM ******/
CREATE NONCLUSTERED INDEX [IX_Query_Nonce] ON [app].[Query]
(
	[Nonce] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Query_Owner]    Script Date: 4/3/19 1:22:36 PM ******/
CREATE NONCLUSTERED INDEX [IX_Query_Owner] ON [app].[Query]
(
	[Owner] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Query_UniversalId]    Script Date: 4/3/19 1:22:36 PM ******/
CREATE NONCLUSTERED INDEX [IX_Query_UniversalId] ON [app].[Query]
(
	[UniversalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[Query] ADD  CONSTRAINT [DF_Query_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[Query] ADD  CONSTRAINT [DF_Query_]  DEFAULT (newid()) FOR [Pepper]
GO
ALTER TABLE [app].[Query] ADD  CONSTRAINT [DF_Query_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [app].[Query] ADD  CONSTRAINT [DF_Query_Updated]  DEFAULT (getdate()) FOR [Updated]
GO
ALTER TABLE [app].[Query] ADD  CONSTRAINT [DF_Query_Ver]  DEFAULT ((1)) FOR [Ver]
GO
