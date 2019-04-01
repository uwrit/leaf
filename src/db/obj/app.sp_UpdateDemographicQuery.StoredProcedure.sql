-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_UpdateDemographicQuery]    Script Date: 4/1/19 9:36:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/28
-- Description: Updates the SqlStatement for the DemographicQuery record.
-- =======================================
CREATE PROCEDURE [app].[sp_UpdateDemographicQuery]
    @sql app.DatasetQuerySqlStatement,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    UPDATE app.DemographicQuery
    SET
        SqlStatement = @sql,
        LastChanged = GETDATE(),
        ChangedBy = @user
    OUTPUT
        inserted.SqlStatement,
        inserted.LastChanged,
        inserted.ChangedBy;
END










GO
