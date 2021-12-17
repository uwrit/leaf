-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_CreateCachedUnsavedQuery]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/13
-- Description: Creates and constrains a new Unsaved Query.
-- =======================================
CREATE PROCEDURE [app].[sp_CreateCachedUnsavedQuery]
    @user auth.[User],
	@definition NVARCHAR(MAX),
    @nonce UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @qid UNIQUEIDENTIFIER;
    DECLARE @qids TABLE
    (
        QueryId UNIQUEIDENTIFIER NOT NULL
    );

    -- clear out previous cohort cache
    EXEC app.sp_DeleteCachedUnsavedQueryByNonce @user, @nonce;

    BEGIN TRAN;

    -- create the query
    INSERT INTO app.Query (UniversalId, Nonce, [Owner], [Definition])
    OUTPUT inserted.Id INTO @qids
    VALUES (null, @nonce, @user, @definition)

    -- get the id
    SELECT TOP 1
        @qid = QueryId
    FROM @qids;

    -- constrain the query
    INSERT INTO auth.QueryConstraint (QueryId, ConstraintId, ConstraintValue)
    VALUES (@qid, 1, @user);

    COMMIT TRAN;

    SELECT @qid;
END












GO
