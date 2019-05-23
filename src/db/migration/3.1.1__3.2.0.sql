-- Add ref.Version Table.
IF OBJECT_ID('ref.Version') IS NOT NULL
	DROP TABLE [ref].[Version]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [ref].[Version](
	[Lock] [char](1) NOT NULL,
	[Version] [nvarchar](100) NOT NULL
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
ALTER TABLE [ref].[Version] ADD  CONSTRAINT [PK_Version] PRIMARY KEY CLUSTERED 
(
	[Lock] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [ref].[Version] ADD  CONSTRAINT [DF_Version_Lock]  DEFAULT ('X') FOR [Lock]
GO
ALTER TABLE [ref].[Version]  WITH CHECK ADD  CONSTRAINT [CK_Version_1] CHECK  (([Lock]='X'))
GO
ALTER TABLE [ref].[Version] CHECK CONSTRAINT [CK_Version_1]
GO

-- Update network sprocs.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


IF OBJECT_ID('network.sp_UpdateEndpoint', 'P') IS NOT NULL
	DROP PROCEDURE [network].[sp_UpdateEndpoint]
GO

IF OBJECT_ID('adm.sp_UpdateEndpoint', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpdateEndpoint];
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
    @isInterrogator bit
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

IF OBJECT_ID('adm.sp_UpsertIdentity', 'P') IS NOT NULL
    DROP PROCEDURE [adm].[sp_UpsertIdentity];
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/5/23
-- Description: Inserts or updates network.Identity.
-- =======================================
CREATE PROCEDURE [adm].[sp_UpsertIdentity]
    @name nvarchar(300),
    @abbr nvarchar(20),
    @desc nvarchar(4000),
    @totalPatients int,
    @lat DECIMAL(7,4),
    @long DECIMAL(7,4),
    @primColor nvarchar(40),
    @secColor nvarchar(40)
AS
BEGIN
    SET NOCOUNT ON

    IF (@name IS NULL)
        THROW 70400, N'NetworkIdentity.Name is required.', 1;

    BEGIN TRAN;

    IF EXISTS (SELECT Lock FROM network.[Identity])
    BEGIN;
        UPDATE network.[Identity]
        SET
            [Name] = @name,
            Abbreviation = @abbr,
            [Description] = @desc,
            TotalPatients = @totalPatients,
            Latitude = @lat,
            Longitude = @long,
            PrimaryColor = @primColor,
            SecondaryColor = @secColor
        OUTPUT
            deleted.Name,
            deleted.Abbreviation,
            deleted.[Description],
            deleted.TotalPatients,
            deleted.Latitude,
            deleted.Longitude,
            deleted.PrimaryColor,
            deleted.SecondaryColor;
    END;
    ELSE
    BEGIN;
        INSERT INTO network.[Identity] ([Name], Abbreviation, [Description], TotalPatients, Latitude, Longitude, PrimaryColor, SecondaryColor)
        OUTPUT NULL as [Name], NULL as Abbreviation, NULL as [Description], NULL as TotalPatients, NULL as Latitude, NULL as Longitude, NULL as PrimaryColor, NULL as SecondaryColor
        VALUES (@name, @abbr, @desc, @totalPatients, @lat, @long, @primColor, @secColor);
    END;

    COMMIT;
END

GO






-- set version
INSERT INTO [ref].[Version] (Lock, [Version])
SELECT 'X', N'3.2.0';