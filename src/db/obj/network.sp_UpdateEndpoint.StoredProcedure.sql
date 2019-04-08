-- Copyright (c) 2019, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [network].[sp_UpdateEndpoint]    Script Date: 4/8/19 2:16:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Update the given network.Endpoint
-- =============================================
CREATE PROCEDURE [network].[sp_UpdateEndpoint]
	@id int,
	@name nvarchar(200),
	@address nvarchar(1000),
	@issuer nvarchar(200),
	@keyid nvarchar(200),
	@certificate nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;

    UPDATE network.Endpoint
	SET
		Name = @name,
		Address = @address,
		Issuer = @issuer,
		KeyId = @keyid,
		Certificate = @certificate,
        Updated = getdate()
    OUTPUT
        deleted.Id,
        deleted.Name,
        deleted.Address,
        deleted.Issuer,
        deleted.KeyId,
        deleted.Certificate
	WHERE
		Id = @id;
END












GO
