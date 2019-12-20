-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedTableType [app].[ImportDataTable]    Script Date: ******/
CREATE TYPE [app].[ImportDataTable] AS TABLE(
	[Id] [nvarchar](200) NOT NULL,
	[ImportMetadataId] [uniqueidentifier] NOT NULL,
	[PersonId] [nvarchar](100) NOT NULL,
	[SourcePersonId] [nvarchar](100) NOT NULL,
	[SourceValue] [nvarchar](100) NULL,
	[SourceModifier] [nvarchar](100) NULL,
	[ValueString] [nvarchar](100) NULL,
	[ValueNumber] [decimal](18, 3) NULL,
	[ValueDate] [datetime] NULL
)
GO
