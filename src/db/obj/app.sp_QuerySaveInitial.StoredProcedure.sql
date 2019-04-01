-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_QuerySaveInitial]    Script Date: 4/1/19 1:47:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/1/9
-- Description: Performs the initial homerun query save.
-- =======================================
CREATE PROCEDURE [app].[sp_QuerySaveInitial]
    @queryid UNIQUEIDENTIFIER,
    @urn app.UniversalId,
    @name nvarchar(200),
    @category nvarchar(200),
    @conceptids app.ResourceIdTable READONLY,
    @queryids app.ResourceIdTable READONLY,
    @definition app.QueryDefinitionJson,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- ensure saving user is the owner of the query
    DECLARE @owner NVARCHAR(200), @qid UNIQUEIDENTIFIER;

    SELECT @qid = Id, @owner = [Owner]
    FROM app.Query
    WHERE Id = @queryid;

    IF (@qid IS NULL)
    BEGIN;
        SELECT UniversalId = NULL, Ver = NULL WHERE 1 = 0;
        RETURN;
    END;
    
    IF (@owner != @user)
    BEGIN;
        DECLARE @403msg NVARCHAR(400) = N'Query ' + cast(@queryid as nvarchar(50)) + N' is not owned by ' + @user;
        THROW 70403, @403msg, 1;
    END;

    -- if so begin transaction and continue
    BEGIN TRAN;

    BEGIN TRY

        EXEC app.sp_InternalQuerySaveInitial @queryid, @urn, 1, @name, @category, @conceptids, @queryids, @definition, @user;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
    
    SELECT UniversalId, Ver
    FROM app.Query
    WHERE Id = @queryid
END









GO
