-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreateConceptSqlSet]    Script Date:******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/8/3
-- Description: Creates a new ConceptSqlSet.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateConceptSqlSet]
    @isEncounterBased bit,
    @isEventBased bit,
    @sqlSetFrom nvarchar(1000),
    @sqlFieldDate nvarchar(1000),
    @sqlFieldEvent nvarchar(400),
    @eventId int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (@sqlSetFrom IS NULL OR LEN(@sqlSetFrom) = 0)
        THROW 70409, N'ConceptSqlSet.SqlSetFrom is required.', 1;

    INSERT INTO app.ConceptSqlSet (IsEncounterBased, IsEventBased, SqlSetFrom, SqlFieldDate, SqlFieldEvent, EventId, Created, CreatedBy, Updated, UpdatedBy)
    OUTPUT inserted.Id, inserted.IsEncounterBased, inserted.IsEventBased, inserted.SqlSetFrom, inserted.SqlFieldDate, inserted.SqlFieldEvent, inserted.EventId
    SELECT @isEncounterBased, @isEventBased, @sqlSetFrom, @sqlFieldDate, @sqlFieldEvent, @eventId, GETDATE(), @user, GETDATE(), @user
END






GO
