-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[GeneralEquivalenceMapping]    Script Date: 5/28/19 1:33:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[GeneralEquivalenceMapping](
	[SourceCode] [nvarchar](10) NOT NULL,
	[TargetCode] [nvarchar](10) NOT NULL,
	[SourceCodeType] [nvarchar](10) NOT NULL,
	[TargetCodeType] [nvarchar](10) NOT NULL,
	[UiDisplayTargetName] [nvarchar](400) NULL,
 CONSTRAINT [PK_GeneralEquivalenceMapping] PRIMARY KEY CLUSTERED 
(
	[SourceCode] ASC,
	[TargetCode] ASC,
	[SourceCodeType] ASC,
	[TargetCodeType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
