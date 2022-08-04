-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  UserDefinedTableType [app].[DatasetQueryTagTable]    Script Date: ******/
CREATE TYPE [app].[DatasetQueryTagTable] AS TABLE(
	[Tag] [nvarchar](100) NOT NULL
)
GO
