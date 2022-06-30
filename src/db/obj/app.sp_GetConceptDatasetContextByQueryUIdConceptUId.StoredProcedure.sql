-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetConceptDatasetContextByQueryUIdConceptUId]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2020/12/28
-- Description: Retrieves the Query by UId and Concept by UId.
-- =======================================
CREATE PROCEDURE [app].[sp_GetConceptDatasetContextByQueryUIdConceptUId]
    @queryuid UNIQUEIDENTIFIER,
    @uid [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    -- convert queryuid to queryid
    DECLARE @qid UNIQUEIDENTIFIER;
    SELECT TOP 1 @qid = Id
    FROM app.Query AS Q
    WHERE Q.UniversalId = @queryuid;

    -- convert conceptuid to conceptid
    DECLARE @conceptid UNIQUEIDENTIFIER
    SELECT TOP 1 @conceptid = Id
    FROM app.Concept AS C
    WHERE C.UniversalId = @uid

    EXEC app.sp_GetConceptDatasetContextByQueryIdConceptId @qid, @conceptid, @user, @groups, @admin
END

GO
