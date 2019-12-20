-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_InternalQuerySaveInitial]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Contains core logic for initial save functionality.
-- =======================================
CREATE PROCEDURE [app].[sp_InternalQuerySaveInitial]
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @ver int,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- update app.Query with name, category, universalid, remove nonce
    UPDATE app.Query
    SET
        Nonce = NULL,
		[Owner] = @user,
        [Name] = @name,
        Category = @category,
        UniversalId = @urn,
        Ver = @ver
    WHERE Id = @queryid;

    -- insert definition into app.QueryDefinition
    INSERT INTO app.QueryDefinition
    SELECT @queryid, @definition;

    -- insert dependencies into rela.QueryConceptDependency
    INSERT INTO rela.QueryConceptDependency
    SELECT @queryid, Id
    FROM @conceptids;
    
    -- insert dependencies into rela.QueryDependency
    INSERT INTO rela.QueryDependency
    SELECT @queryid, Id
    FROM @queryids;

END

GO
