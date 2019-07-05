-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_GetDatasetQueryById]    Script Date: 7/5/19 11:48:10 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/6/4
-- Description: Get an app.DatasetQuery by Id for admins.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetDatasetQueryById]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    -- Get query definition.
    SELECT
        dq.Id,
        dq.UniversalId,
        dq.Shape,
        dq.Name,
        dq.CategoryId,
        dq.[Description],
        dq.SqlStatement,
        dq.Created,
        dq.CreatedBy,
        dq.Updated,
        dq.UpdatedBy
    FROM app.DatasetQuery dq
    WHERE dq.Id = @id;

    -- Get tags
    SELECT
        DatasetQueryId,
        Tag
    FROM app.DatasetQueryTag
    WHERE DatasetQueryId = @id;

    -- Get constraints
    SELECT
        DatasetQueryId,
        ConstraintId,
        ConstraintValue
    FROM auth.DatasetQueryConstraint
    WHERE DatasetQueryId = @id;
END

GO
