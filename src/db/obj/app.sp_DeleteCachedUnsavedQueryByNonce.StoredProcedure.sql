-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_DeleteCachedUnsavedQueryByNonce]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/10
-- Description: Deletes a user's previous cached cohort and query by Nonce
-- =======================================
CREATE PROCEDURE [app].[sp_DeleteCachedUnsavedQueryByNonce]
    @user auth.[User],
    @nonce UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @qid UNIQUEIDENTIFIER;
    DECLARE @owner nvarchar(1000);

    -- Ensure an Atomic Operation as there are many steps here
    BEGIN TRAN;
    
    -- convert Nonce into queryid IF AND ONLY IF the user owns the query
    SELECT
        @qid = Id,
        @owner = [Owner]
    FROM app.Query
    WHERE Nonce = @nonce;

    -- query not found, just rollback and bounce
    IF (@qid is null)
    BEGIN;
        ROLLBACK TRAN;
        RETURN 0;
    END;

    -- query found but not owned
    IF (@owner != @user)
    BEGIN;
        DECLARE @security nvarchar(1000) = @user + ' cannot delete query ' + cast(@qid as nvarchar(50));
        THROW 70403, @security, 1;
    END;

    -- remove cached cohort
    DELETE FROM app.Cohort
    WHERE QueryId = @qid;

    -- unconstrain query
    DELETE FROM auth.QueryConstraint
    WHERE QueryId = @qid;

    -- delete unsaved query
    DELETE FROM app.Query
    WHERE Id = @qid;
    
    COMMIT TRAN;

END

















GO
