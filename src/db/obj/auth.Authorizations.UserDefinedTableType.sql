-- Copyright (c) 2019, UW Medicine Research IT
-- Developed by Nic Dobbins and Cliff Spital
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedTableType [auth].[Authorizations]    Script Date: 3/28/19 1:44:09 PM ******/
CREATE TYPE [auth].[Authorizations] AS TABLE(
	[ConstraintId] [int] NOT NULL,
	[ConstraintValue] [nvarchar](200) NOT NULL
)
GO
