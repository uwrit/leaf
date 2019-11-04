-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetImportMetadataBySourceId]    Script Date: 11/4/2019 11:22:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/9/30
-- Description: Retrieves Import Metadata by SourceId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetImportMetadataBySourceId]
	@sourceId nvarchar(100),
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

	DECLARE @id uniqueidentifier = (SELECT TOP 1 Id from app.ImportMetadata WHERE SourceId = @sourceId)

	EXEC app.sp_GetImportMetadataById @id, @user, @groups, @admin

END

GO
