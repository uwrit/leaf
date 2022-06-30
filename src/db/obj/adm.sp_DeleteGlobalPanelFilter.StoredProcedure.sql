-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_DeleteGlobalPanelFilter]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/8/26
-- Description: Deletes an app.GlobalPanelFilter.
-- =======================================
CREATE PROCEDURE [adm].[sp_DeleteGlobalPanelFilter]
	@id int
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;
    BEGIN TRY

        IF NOT EXISTS (SELECT 1 FROM app.GlobalPanelFilter WHERE Id = @id)
            THROW 70409, N'GlobalPanelFilter does not exist.', 1;

		DELETE app.GlobalPanelFilter
		OUTPUT deleted.Id
		WHERE Id = @id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
