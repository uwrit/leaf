-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_GetParentConceptsByChildIds]    Script Date: 4/1/19 10:56:32 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins; Ported by Cliff Spital
-- Create date: 2018/6/27
-- Description: Returns parent concept Ids for the given child concept Ids
-- =======================================
CREATE PROCEDURE [app].[sp_GetParentConceptsByChildIds]
    @ids app.ResourceIdTable READONLY,
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
    @outputLimit int = 20,
    @admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    CREATE TABLE #t
    (
        Id [uniqueidentifier] null,
        ParentId [uniqueidentifier] null,
        TreeLevel int null,
        PatientCount int null
    )

    INSERT INTO #t
    SELECT TOP (@outputLimit)
        c.Id,
        c.ParentId,
        TreeLevel = 0,
        c.UiDisplayPatientCount
    FROM app.Concept c 
    WHERE EXISTS (SELECT 1 FROM @ids i WHERE i.Id = c.Id)
    ORDER BY c.UiDisplayPatientCount DESC

    DECLARE
        @LoopCount int = 0,
        @LoopLimit int = 10,
        @RetrievedRows int = 1;
    
    WHILE @LoopCount < @LoopLimit AND @RetrievedRows > 0
    BEGIN

        INSERT INTO #t (Id, ParentId, TreeLevel)
        SELECT
            c.Id,
            c.ParentId,
            TreeLevel = @LoopCount + 1 --> NOTE CHS why make this a one based index?
        FROM app.Concept c 
        WHERE EXISTS (SELECT 1 FROM #t t WHERE c.Id = t.ParentId AND t.TreeLevel = @LoopCount)

        SET @RetrievedRows = @@ROWCOUNT
        SET @LoopCount += 1

    END

    DECLARE @requested app.ResourceIdTable;
    INSERT INTO @requested
    SELECT DISTINCT Id
    FROM #t;

    DECLARE @allowed app.ResourceIdTable;
    INSERT INTO @allowed
    EXEC app.sp_FilterConceptsByConstraint @user, @groups, @requested, @admin = @admin;

    EXEC app.sp_HydrateConceptsByIds @allowed;
END














GO
