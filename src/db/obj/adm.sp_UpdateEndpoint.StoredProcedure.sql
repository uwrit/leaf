-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateEndpoint]    Script Date: 6/6/19 11:15:59 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2019/5/28
-- Description:	Update the given network.Endpoint
-- =============================================
CREATE PROCEDURE [adm].[sp_UpdateEndpoint]
	@id int,
	@name nvarchar(200),
	@addr nvarchar(1000),
	@iss nvarchar(200),
	@kid nvarchar(200),
	@cert nvarchar(max),
    @isResponder bit,
    @isInterrogator bit,
    @user auth.[User]
AS
BEGIN
	SET NOCOUNT ON;

    IF (@id IS NULL)
		THROW 70400, N'NetworkEndpoint.Id is required.', 1;

	IF (@name IS NULL)
        THROW 70400, N'NetworkEndpoint.Name is required.', 1;
    
    IF (@addr IS NULL)
        THROW 70400, N'NetworkEndpoint.Address is required.', 1;
    
    IF (@iss IS NULL)
        THROW 70400, N'NetworkEndpoint.Issuer is required.', 1;
    
    IF (@kid IS NULL)
        THROW 70400, N'NetworkEndpoint.KeyId is required.', 1;
    
    IF (@cert IS NULL)
        THROW 70400, N'NetworkEndpoint.Certificate is required.', 1;
    
    IF (@isInterrogator IS NULL)
        THROW 70400, N'NetworkEndpoint.IsInterrogator is required.', 1;

    IF (@isResponder IS NULL)
        THROW 70400, N'NetworkEndpoint.IsResponder is required.', 1;

    IF NOT EXISTS (SELECT 1 FROM network.Endpoint WHERE Id = @id)
			THROW 70404, N'NetworkEndpoint not found.', 1;

	BEGIN TRAN;

	UPDATE network.Endpoint
	SET
		Name = @name,
		Address = @addr,
		Issuer = @iss,
		KeyId = @kid,
		Certificate = @cert,
		IsResponder = @isResponder,
		IsInterrogator = @isInterrogator,
        Updated = GETDATE()
	OUTPUT
		inserted.Id,
		inserted.Name,
		inserted.Address,
		inserted.Issuer,
		inserted.KeyId,
		inserted.Certificate,
		inserted.IsResponder,
		inserted.IsInterrogator,
		inserted.Updated,
		inserted.Created
	WHERE
		Id = @id;

	COMMIT;
END

GO
