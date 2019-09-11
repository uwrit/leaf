-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [auth].[sp_UpsertLogin]    Script Date: 9/11/19 9:39:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/7/24
-- Description: Records a Login event from Leaf
-- =======================================
CREATE PROCEDURE [auth].[sp_UpsertLogin]
    @scopedId nvarchar(500),
    @fullId nvarchar(1000),
    @claims nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @id UNIQUEIDENTIFIER;
    SELECT @id = Id FROM auth.Login WHERE ScopedIdentity = @scopedId;
    IF (@id IS NOT NULL)
    BEGIN;
        UPDATE auth.[Login]
        SET
            ScopedIdentity = @scopedId,
            FullIdentity = @fullId,
            Claims = @claims,
            Updated = GETDATE()
        WHERE Id = @id;
    END;
    ELSE
    BEGIN;
        INSERT INTO auth.[Login] (ScopedIdentity, FullIdentity, Claims, Created, Updated)
        SELECT @scopedId, @fullId, @claims, GETDATE(), GETDATE();
    END;
END

GO
