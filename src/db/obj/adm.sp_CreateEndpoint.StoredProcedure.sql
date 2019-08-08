-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreateEndpoint]    Script Date: 8/8/2019 3:56:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/5/23
-- Description: Creates a new network.Endpoint
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateEndpoint]
    @name nvarchar(200),
    @addr nvarchar(1000),
    @iss nvarchar(200),
    @kid nvarchar(200),
    @cert nvarchar(max),
    @isInterrogator bit,
    @isResponder bit,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON

    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'NetworkEndpoint.Name is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@addr) = 1)
        THROW 70400, N'NetworkEndpoint.Address is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@iss) = 1)
        THROW 70400, N'NetworkEndpoint.Issuer is required.', 1;

    IF (app.fn_NullOrWhitespace(@kid) = 1)
        THROW 70400, N'NetworkEndpoint.KeyId is required.', 1;
    
    IF (app.fn_NullOrWhitespace(@cert) = 1)
        THROW 70400, N'NetworkEndpoint.Certificate is required.', 1;
    
    IF (@isInterrogator IS NULL)
        THROW 70400, N'NetworkEndpoint.IsInterrogator is required.', 1;

    IF (@isResponder IS NULL)
        THROW 70400, N'NetworkEndpoint.IsResponder is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM network.Endpoint WHERE Name = @name OR KeyId = @kid OR Issuer = @iss)
            THROW 70409, N'NetworkEndpoint already exists with that name, key id, or issuer value.', 1;

        INSERT INTO network.Endpoint ([Name], [Address], Issuer, KeyId, [Certificate], Created, Updated, IsInterrogator, IsResponder)
        OUTPUT inserted.Id, inserted.Name, inserted.Address, inserted.Issuer, inserted.KeyId, inserted.Certificate, inserted.Created, inserted.Updated, inserted.IsInterrogator, inserted.IsResponder
        VALUES (@name, @addr, @iss, @kid, @cert, getdate(), getdate(), @isInterrogator, @isResponder);
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO
