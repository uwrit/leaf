-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetPreflightConceptByUId]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/10/24
-- Description: Retrieves preflight report and concepts requested by universalIds.
-- =======================================
CREATE PROCEDURE [app].[sp_GetPreflightConceptByUId]
    @uid nvarchar(200),
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @requested app.ResourceUniversalIdTable;

    INSERT INTO @requested
    SELECT @uid;

    DECLARE @preflight app.ConceptPreflightTable;
    INSERT INTO @preflight
    EXEC app.sp_UniversalConceptPreflightCheck @requested, @user, @groups, @admin = @admin;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    SELECT Id
    FROM @preflight
    WHERE IsPresent = 1 and IsAuthorized = 1;

    SELECT Id, UniversalId, IsPresent, IsAuthorized
    FROM @preflight;

    exec app.sp_HydrateConceptsByIds @allowed;

END










GO
