-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedTableType [app].[SqlSelectors]    Script Date: ******/
CREATE TYPE [app].[SqlSelectors] AS TABLE(
	[Column] [nvarchar](100) NOT NULL,
	[Type] [nvarchar](20) NOT NULL,
	[Phi] [bit] NOT NULL,
	[Mask] [bit] NOT NULL,
	PRIMARY KEY CLUSTERED 
(
	[Column] ASC
)WITH (IGNORE_DUP_KEY = OFF)
)
GO
