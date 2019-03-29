-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetDatasetContextByDatasetIdQueryUId]    Script Date: 3/29/19 11:06:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/12/5
-- Description: Retrieves the app.Query.Pepper and app.DatasetQuery by Query.UniversalId and DatasetQuery.Id.
-- =======================================
CREATE PROCEDURE [app].[sp_GetDatasetContextByDatasetIdQueryUId]
    @datasetid UNIQUEIDENTIFIER,
    @queryuid app.UniversalId,
    @user auth.[User],
    @groups auth.GroupMembership READONLY
AS
BEGIN
    SET NOCOUNT ON

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.Query
    WHERE app.Query.UniversalId = @queryuid;

    EXEC app.sp_GetDatasetContextById @datasetid, @qid, @user, @groups;
END





GO
