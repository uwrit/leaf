-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedTableType [app].[ConceptPreflightTable]    Script Date: 11/4/2019 11:22:23 AM ******/
CREATE TYPE [app].[ConceptPreflightTable] AS TABLE(
	[Id] [uniqueidentifier] NULL,
	[UniversalId] [nvarchar](200) NULL,
	[IsPresent] [bit] NULL,
	[IsAuthorized] [bit] NULL
)
GO
