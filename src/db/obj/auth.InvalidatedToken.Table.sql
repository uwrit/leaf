-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  Table [auth].[InvalidatedToken]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [auth].[InvalidatedToken](
	[IdNonce] [uniqueidentifier] NOT NULL,
	[Expires] [datetime] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Index [IX_TokenBlacklist_Expires]    Script Date: ******/
CREATE NONCLUSTERED INDEX [IX_TokenBlacklist_Expires] ON [auth].[InvalidatedToken]
(
	[Expires] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
