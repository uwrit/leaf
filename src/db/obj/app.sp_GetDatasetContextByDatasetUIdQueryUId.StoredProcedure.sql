-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextByDatasetUIdQueryUId]    Script Date: 4/3/19 1:31:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/6
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.UniversalId and DatasetQuery.UniversalId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetContextByDatasetUIdQueryUId]
    @datasetuid app.UniversalId,
    @queryuid app.UniversalId,
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

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.DatasetQuery
    WHERE app.DatasetQuery.UniversalId = @queryuid;

    -- do the normal thing
    EXEC app.sp_GetDatasetContextById @did, @qid, @user, @groups, @admin = @admin;
END






GO
