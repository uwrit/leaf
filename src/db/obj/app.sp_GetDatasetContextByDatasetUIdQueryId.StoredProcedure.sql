-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextByDatasetUIdQueryId]    Script Date: 4/3/19 1:22:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/6
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.Id and DatasetQuery.UniversalId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetContextByDatasetUIdQueryId]
    @datasetuid app.UniversalId,
    @queryid UNIQUEIDENTIFIER,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- convert datasetuid to datasetid
    DECLARE @did UNIQUEIDENTIFIER;
    SELECT TOP 1 @did = Id
    FROM app.DatasetQuery
    WHERE app.DatasetQuery.UniversalId = @datasetuid;

    -- do the normal thing
    EXEC app.sp_GetDatasetContextById @did, @queryid, @user, @groups, @admin = @admin;
END






GO
