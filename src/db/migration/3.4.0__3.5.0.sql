USE [LeafDB]
GO

/*
 * Update version.
 */
IF EXISTS (SELECT 1 FROM [ref].[Version])
    UPDATE ref.Version
    SET [Version] = '3.5.0'
ELSE 
    INSERT INTO ref.[Version] (Lock, Version)
    SELECT 'X', '3.5.0'

/* 
 * ref.ImportType
 */
CREATE TABLE ref.ImportType
(
    Id INT NOT NULL,
    Variant NVARCHAR(100) NOT NULL
    CONSTRAINT [PK_Import_1] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO ref.ImportType (Id, Variant)
VALUES (1, 'REDCap Project'), (2, 'MRN')

/* 
 * app.ImportMetadata
 */
CREATE TABLE app.ImportMetadata
(
    [Id] UNIQUEIDENTIFIER NOT NULL,
    [Structure] NVARCHAR(MAX) NOT NULL,
    [Type] INT NOT NULL,

    Created DATETIME NOT NULL,
    CreatedBy NVARCHAR(200) NOT NULL,
    Updated DATETIME NOT NULL,
    UpdatedBy NVARCHAR(200) NOT NULL,

    CONSTRAINT [PK_ImportMetadata_1] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [app].[ImportMetadata] ADD  CONSTRAINT [DF_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[ImportMetadata]  WITH CHECK ADD CONSTRAINT [FK_ImportMetadata_Type] FOREIGN KEY([Type]) REFERENCES [ref].[ImportType] ([Id])
GO
ALTER TABLE [app].[ImportMetadata] CHECK CONSTRAINT [FK_ImportMetadata_Type]
GO

/*
 * app.Import
 */
CREATE TABLE app.Import
(
    [Id] NVARCHAR(200) NOT NULL,
    [ImportMetadataId] UNIQUEIDENTIFIER NOT NULL,
    [PersonId] NVARCHAR(200) NOT NULL,
    [SourcePersonId] NVARCHAR(200) NOT NULL,
    [SourceValue] NVARCHAR(100) NOT NULL,
    [ValueString] NVARCHAR(100) NULL,
    [ValueNumber] DECIMAL(18,3) NULL,
    [ValueDate] DATETIME NULL,
    
    CONSTRAINT [PK_Import_1] PRIMARY KEY CLUSTERED 
(
    [Id] ASC,
    [ImportMetadataId] ASC,
    [PersonId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


