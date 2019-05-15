ALTER TABLE [network].[Endpoint]  ADD [IsInterrogator] BIT NOT NULL
ALTER TABLE [network].[Endpoint]  ADD [IsResponder] BIT NOT NULL

ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_IsInterrogator]  DEFAULT (0) FOR [IsInterrogator]
ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_IsResponder]  DEFAULT (0) FOR [IsResponder]
GO

DROP PROCEDURE [network].[sp_CreateEndpoint]
DROP PROCEDURE [network].[sp_DeleteEndpointById]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Cliff Spital
-- Create date: 2018/6/12
-- Description:	Gets all network.Endpoint records.
-- =============================================
ALTER PROCEDURE [network].[sp_GetEndpoints]
AS
BEGIN
	SET NOCOUNT ON;

    SELECT
		Id,
		Name,
		Address,
		Issuer,
		KeyId,
		Certificate,
	        IsInterrogator,
       		IsResponder
	FROM
		network.Endpoint;
END

GO
