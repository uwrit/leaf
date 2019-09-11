-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateGlobalPanelFilter]    Script Date: 9/11/19 9:39:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [adm].[sp_UpdateGlobalPanelFilter]
	@id int,
    @sessionType auth.SessionType,
	@isInclusion bit,
	@sqlSetId int,
	@sqlSetWhere nvarchar(1000),
	@user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    BEGIN TRAN;
    BEGIN TRY

		IF NOT EXISTS (SELECT 1 FROM app.GlobalPanelFilter WHERE Id = @id)
            THROW 70409, N'GlobalPanelFilter does not exist.', 1;

		SET @sessionType = CASE @sessionType WHEN 0 THEN NULL ELSE @sessionType END

		UPDATE app.GlobalPanelFilter
		SET SessionType = @sessionType
		  , IsInclusion = @isInclusion
		  , SqlSetId = @sqlSetId
		  , SqlSetWhere = @sqlSetWhere
		  , Updated = GETDATE()
		  , UpdatedBy = @user
		OUTPUT inserted.Id, inserted.SessionType, inserted.IsInclusion, inserted.SqlSetId, inserted.SqlSetWhere
		WHERE Id = @id

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
