-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_UpdateEndpoint]    Script Date: 5/23/19 3:52:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Update the given network.Endpoint
-- =============================================
CREATE PROCEDURE [adm].[sp_UpdateEndpoint]
	@id int,
	@name nvarchar(200),
	@address nvarchar(1000),
	@issuer nvarchar(200),
	@keyid nvarchar(200),
	@certificate nvarchar(max),
    @isResponder bit,
    @isInterrogator bit,
    @user auth.[User]
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRAN;

	IF NOT EXISTS (SELECT 1 FROM network.Endpoint WHERE Id = @id)
			THROW 70404, N'NetworkEndpoint not found.', 1;

	UPDATE network.Endpoint
	SET
		Name = @name,
		Address = @address,
		Issuer = @issuer,
		KeyId = @keyid,
		Certificate = @certificate,
		IsResponder = @isResponder,
		IsInterrogator = @isInterrogator
	OUTPUT
		deleted.Id,
		deleted.Name,
		deleted.Address,
		deleted.Issuer,
		deleted.KeyId,
		deleted.Certificate,
		deleted.IsResponder,
		deleted.IsInterrogator,
		deleted.Updated,
		deleted.Created
	WHERE
		Id = @id;

	COMMIT;
END


GO
