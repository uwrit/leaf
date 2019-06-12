-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[DatasetQueryCategory]    Script Date: 6/12/19 9:23:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[DatasetQueryCategory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Category] [nvarchar](200) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatedBy] [nvarchar](1000) NOT NULL,
	[Updated] [datetime] NOT NULL,
	[UpdatedBy] [nvarchar](1000) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IXUniq_DatasetQueryCategory_Category]    Script Date: 6/12/19 9:23:03 AM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_DatasetQueryCategory_Category] ON [app].[DatasetQueryCategory]
(
	[Category] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [app].[DatasetQueryCategory] ADD  CONSTRAINT [DF_DatasetQueryCategory_Created]  DEFAULT (getdate()) FOR [Created]
GO
