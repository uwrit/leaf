-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  Table [app].[ImportPatientMappingQuery]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [app].[ImportPatientMappingQuery](
	[Lock] [char](1) NOT NULL,
	[SqlStatement] [nvarchar](4000) NOT NULL,
	[SqlFieldSourceId] [nvarchar](100) NOT NULL,
	[LastChanged] [datetime] NOT NULL,
	[ChangedBy] [nvarchar](200) NOT NULL,
 CONSTRAINT [PK_ImportPatientMappingQuery] PRIMARY KEY CLUSTERED 
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [app].[ImportPatientMappingQuery] ADD  CONSTRAINT [DF_ImportPatientMappingQuery_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [app].[ImportPatientMappingQuery]  WITH CHECK ADD  CONSTRAINT [CK_ImportPatientMappingQuery_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [app].[ImportPatientMappingQuery] CHECK CONSTRAINT [CK_ImportPatientMappingQuery_1]
GO
