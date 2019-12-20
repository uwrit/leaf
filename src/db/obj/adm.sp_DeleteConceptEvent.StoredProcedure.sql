-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteConceptEvent]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Deletes an app.ConceptSqlEvent by id.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteConceptEvent]
    @id int,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS(SELECT 1 FROM app.ConceptEvent WHERE Id = @id)
        THROW 70404, N'app.ConceptEvent is missing.', 1;

    BEGIN TRAN;
    BEGIN TRY
        DELETE FROM app.ConceptEvent
        WHERE Id = @id;

        COMMIT;

        SELECT Id = NULL, SqlSetFrom = NULL
        WHERE 0 = 1;
    END TRY
    BEGIN CATCH
        DECLARE @sqlSets TABLE (
            Id int,
            SqlSetFrom nvarchar(1000) NULL
        );
        INSERT INTO @sqlSets
        SELECT Id, SqlSetFrom
        FROM app.ConceptSqlSet
        WHERE app.ConceptSqlSet.EventId = @id;

        ROLLBACK;

        IF EXISTS(SELECT 1 FROM @sqlSets)
        BEGIN;
            SELECT Id, SqlSetFrom
            FROM @sqlSets;
            RETURN;
        END;
        THROW;
    END CATCH;
END







GO
