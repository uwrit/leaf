ALTER TABLE [network].[Endpoint]  ADD [IsInterrogator] BIT NOT NULL
ALTER TABLE [network].[Endpoint]  ADD [IsResponder] BIT NOT NULL

ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_IsInterrogator]  DEFAULT (0) FOR [IsInterrogator]
ALTER TABLE [network].[Endpoint] ADD  CONSTRAINT [DF_Endpoint_IsResponder]  DEFAULT (0) FOR [IsResponder]