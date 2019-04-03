-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  UserDefinedDataType [app].[DatasetQueryName]    Script Date: 4/3/19 1:31:59 PM ******/
CREATE TYPE [app].[DatasetQueryName] FROM [nvarchar](200) NOT NULL
GO
