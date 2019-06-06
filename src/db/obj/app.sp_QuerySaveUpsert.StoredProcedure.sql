-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_QuerySaveUpsert]    Script Date: 6/6/19 8:49:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/1/9
-- Description: Performs a query upsert save.
-- =======================================
CREATE PROCEDURE [app].[sp_QuerySaveUpsert]
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

    -- ensure saving user is the owner of the query
    DECLARE @owner NVARCHAR(1000), @qid UNIQUEIDENTIFIER;

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
        DECLARE @new403msg NVARCHAR(400) = N'Query ' + cast(@queryid as nvarchar(50)) + N' is not owned by ' + @user;
        THROW 70403, @new403msg, 1;
    END;

    -- determine if urn exists already
    DECLARE @oldowner NVARCHAR(1000), @oldqid UNIQUEIDENTIFIER, @oldver int;

    BEGIN TRAN;
    BEGIN TRY

        SELECT @oldqid = Id, @oldowner = [Owner], @oldver = Ver
        FROM app.Query
        WHERE UniversalId = @urn;

        IF (@oldqid IS NULL) -- if no this is an initial save for the node
        BEGIN;
            -- delegate to querysaveinitial
            EXEC app.sp_InternalQuerySaveInitial @queryid, @urn, 1, @name, @category, @conceptids, @queryids, @definition, @user;
        END;
        ELSE -- if yes this is a resave, ensure the old query is also owned by the user
        BEGIN;
            IF (@oldowner != @user)
            BEGIN;
                DECLARE @old403msg NVARCHAR(400) = N'Query ' + cast(@oldqid as nvarchar(50)) + N' is not owned by ' + @user;
                THROW 70403, @old403msg, 1;
            END;

            -- home node resave
            IF @ver IS NULL AND @oldver IS NOT NULL
                SET @ver = @oldver + 1;
                
            IF (@oldqid = @queryid)
            BEGIN;
                -- check for shallow save, @oldid = @queryid, app.Query update only, bump ver, incr updated.
                UPDATE app.Query
                SET
                    [Name] = @name,
                    Category = @category,
                    Updated = GETDATE(),
                    Ver = @ver
                WHERE Id = @queryid;
            END;
            ELSE
            BEGIN;
                -- delegate to resave sproc
                EXEC app.sp_InternalQuerySaveUpdateMove @oldqid, @queryid, @urn, @ver, @name, @category, @conceptids, @queryids, @definition, @user;
            END;
        END;
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
    
    SELECT UniversalId, Ver
    FROM app.Query
    WHERE Id = @queryid;
END












GO
