-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateDemographicQuery]    Script Date: 8/8/2019 3:56:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [adm].[sp_UpdateDemographicQuery]
    @sql nvarchar(4000),
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DemographicQuery.SqlStatement is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        
        IF EXISTS (SELECT Lock FROM app.DemographicQuery)
        BEGIN;
            UPDATE app.DemographicQuery
            SET
                SqlStatement = @sql,
                LastChanged = GETDATE(),
                ChangedBy = @user
            OUTPUT
                inserted.SqlStatement,
                inserted.LastChanged,
                inserted.ChangedBy;
        END;
        ELSE
        BEGIN;
            INSERT INTO app.DemographicQuery (SqlStatement, LastChanged, ChangedBy, Shape)
            OUTPUT inserted.SqlStatement, inserted.LastChanged, inserted.ChangedBy, inserted.Shape
            VALUES (@sql, GETDATE(), @user, 3);
        END;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END

GO
