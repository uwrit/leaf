-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedTableType [app].[HydratedConceptTable]    Script Date: 4/3/19 1:22:36 PM ******/
CREATE TYPE [app].[HydratedConceptTable] AS TABLE(
	[Id] [uniqueidentifier] NOT NULL,
	[ParentId] [uniqueidentifier] NULL,
	[RootId] [uniqueidentifier] NULL,
	[ExternalId] [nvarchar](200) NULL,
	[ExternalParentId] [nvarchar](200) NULL,
	[UniversalId] [nvarchar](200) NULL,
	[IsNumeric] [bit] NULL,
	[IsEventBased] [bit] NULL,
	[IsParent] [bit] NULL,
	[IsEncounterBased] [bit] NULL,
	[IsPatientCountAutoCalculated] [bit] NULL,
	[IsDropdown] [bit] NULL,
	[SqlSetFrom] [nvarchar](4000) NULL,
	[SqlSetWhere] [nvarchar](1000) NULL,
	[SqlFieldDate] [nvarchar](1000) NULL,
	[SqlFieldNumeric] [nvarchar](1000) NULL,
	[SqlFieldEventId] [nvarchar](400) NULL,
	[UiDisplayName] [nvarchar](400) NULL,
	[UiDisplayText] [nvarchar](1000) NULL,
	[UiDisplayUnits] [nvarchar](50) NULL,
	[UiDisplayTooltip] [nvarchar](max) NULL,
	[UiDisplayPatientCount] [int] NULL,
	[UiDisplayPatientCountByYear] [nvarchar](max) NULL,
	[UiDropdownElements] [nvarchar](max) NULL,
	[UiDropdownDefaultText] [nvarchar](400) NULL,
	[UiNumericDefaultText] [nvarchar](50) NULL,
	PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (IGNORE_DUP_KEY = OFF)
)
GO
