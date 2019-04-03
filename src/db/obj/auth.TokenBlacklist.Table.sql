-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [auth].[TokenBlacklist]    Script Date: 4/3/19 12:21:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [auth].[TokenBlacklist](
	[IdNonce] [uniqueidentifier] NOT NULL,
	[Expires] [datetime] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Index [IX_TokenBlacklist_Expires]    Script Date: 4/3/19 12:21:23 PM ******/
CREATE NONCLUSTERED INDEX [IX_TokenBlacklist_Expires] ON [auth].[TokenBlacklist]
(
	[Expires] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
