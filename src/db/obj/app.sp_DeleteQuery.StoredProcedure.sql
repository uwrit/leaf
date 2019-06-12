-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_DeleteQuery]    Script Date: 6/12/19 9:23:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/3/6
-- Description: Deletes a query and all dependents (if forced).
-- =======================================
CREATE PROCEDURE [app].[sp_DeleteQuery]
    @uid app.UniversalId,
    @force bit,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    -- make sure the user is the owner of the query and the query exists
    DECLARE @id UNIQUEIDENTIFIER, @owner nvarchar(1000);
    SELECT @id = Id, @owner = [Owner] FROM app.Query WHERE UniversalId = @uid;
    IF (@id IS NULL)
    BEGIN;
        DECLARE @404msg nvarchar(400) = N'Query ' + @uid + N' does not exist';
        THROW 70404, @404msg, 1;
    END;

    IF (@owner != @user)
    BEGIN;
        DECLARE @403msg1 nvarchar(400) = @user + N' does not own query ' + @uid;
        THROW 70403, @403msg1, 1;
    END;

    -- collect query dependents
    declare @dependentRefs table (
        Lvl int,
        QueryId UNIQUEIDENTIFIER,
        QueryUniversalId app.UniversalId,
        [QueryName] NVARCHAR(200),
        [Owner] NVARCHAR(1000),
        DependsOn UNIQUEIDENTIFIER
    );
    with cte (Lvl, QueryId, DependsOn) as (
        select 1, QueryId, DependsOn
        from rela.QueryDependency
        where DependsOn = @id
        union all
        select c.Lvl + 1, qd.QueryId, qd.DependsOn
        from rela.QueryDependency qd
        join cte c on qd.DependsOn = c.QueryId
    )
    insert into @dependentRefs
    select Lvl, QueryId, q.UniversalId, q.Name, q.[Owner], DependsOn
    from cte
    join app.Query q
        on cte.QueryId = q.Id;

    BEGIN TRAN;
    BEGIN TRY
        -- there are dependents
        IF EXISTS (SELECT 1 FROM @dependentRefs)
        BEGIN;
            -- no force, select enriched dependency graph
            IF (@force = 0)
            BEGIN;
                ROLLBACK;
                SELECT Id = QueryId, UniversalId = QueryUniversalId, [Name] = QueryName, [Owner]
                FROM @dependentRefs;
                RETURN;
            END;
            ELSE -- force it
            BEGIN;
                -- if there are any non user owned queries in the tree, bail with 403
                IF ((SELECT COUNT(*) FROM @dependentRefs WHERE [Owner] != @user) > 0)
                BEGIN;
                    declare @403msg2 nvarchar(400) = N'Query ' + @uid + N' has dependents owned by other users.';
                    throw 70403, @403msg2, 1;
                END;

                -- delete all dependents
                DECLARE @forceDeleteId UNIQUEIDENTIFIER;
                DECLARE force_cursor CURSOR FOR
                SELECT QueryId
                FROM @dependentRefs
                ORDER BY Lvl DESC;

                OPEN force_cursor;

                FETCH NEXT FROM force_cursor
                INTO @forceDeleteId;

                WHILE @@FETCH_STATUS = 0
                BEGIN;
                    DELETE FROM auth.QueryConstraint
                    WHERE QueryId = @forceDeleteId;

                    DELETE FROM rela.QueryConceptDependency
                    WHERE QueryId = @forceDeleteId;

                    DELETE FROM rela.QueryDependency
                    WHERE QueryId = @forceDeleteId;

                    DELETE FROM app.QueryDefinition
                    WHERE QueryId = @forceDeleteId;

					DELETE FROM app.Cohort
					WHERE QueryId = @forceDeleteId

                    DELETE FROM app.Query
                    WHERE Id = @forceDeleteId;

                    FETCH NEXT FROM force_cursor
                    INTO @forceDeleteId;
                END;

                CLOSE force_cursor;
                DEALLOCATE force_cursor;
            END;
        END;
        -- delete the constraint, dependencies, querydefinition, query
        DELETE FROM auth.QueryConstraint
        WHERE QueryId = @id;

        DELETE FROM rela.QueryConceptDependency
        WHERE QueryId = @id;

        DELETE FROM rela.QueryDependency
        WHERE QueryId = @id;

        DELETE FROM app.QueryDefinition
        WHERE QueryId = @id;

		DELETE FROM app.Cohort
		WHERE QueryId = @id

        DELETE FROM app.Query
        WHERE Id = @id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

    SELECT Id = QueryId, UniversalId = QueryUniversalId, [Name] = QueryName, [Owner]
    FROM @dependentRefs
    WHERE 0 = 1;
END



GO
