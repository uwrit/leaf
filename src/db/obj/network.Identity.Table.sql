-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [network].[Identity]    Script Date: 5/9/19 8:47:55 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [network].[Identity](
	[Lock] [char](1) NOT NULL,
	[Name] [nvarchar](300) NOT NULL,
	[Abbreviation] [nvarchar](20) NULL,
	[Description] [nvarchar](4000) NULL,
	[TotalPatients] [int] NULL,
	[Latitude] [decimal](7, 4) NULL,
	[Longitude] [decimal](7, 4) NULL,
	[PrimaryColor] [nvarchar](40) NULL,
	[SecondaryColor] [nvarchar](40) NULL,
 CONSTRAINT [PK_NetworkIdentity] PRIMARY KEY CLUSTERED 
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [network].[Identity] ADD  CONSTRAINT [DF_NetworkIdentity_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [network].[Identity]  WITH CHECK ADD  CONSTRAINT [CK_NetworkIdentity_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [network].[Identity] CHECK CONSTRAINT [CK_NetworkIdentity_1]
GO
