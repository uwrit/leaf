

IF OBJECT_ID('auth.sp_CreateLogin') IS NOT NULL
    DROP PROCEDURE auth.sp_CreateLogin;
GO

IF OBJECT_ID('auth.sp_GetLoginByUsername') IS NOT NULL
    DROP PROCEDURE auth.sp_GetLoginByUsername;
GO

IF OBJECT_ID('auth.Login') IS NOT NULL
    DROP TABLE auth.Login;
GO
CREATE TABLE [auth].[Login]
(
    [Id] [uniqueidentifier] NOT NULL,
    ScopedIdentity nvarchar(500) NOT NULL,
    FullIdentity nvarchar(1000) NOT NULL,
    Claims nvarchar(max) NOT NULL,
    Created datetime NOT NULL,
    Updated datetime NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [auth].[Login] ADD CONSTRAINT [PK_Login_Id] PRIMARY KEY CLUSTERED
(
    Id ASC
) ON [PRIMARY]
GO
ALTER TABLE [auth].[Login]
ADD CONSTRAINT DF_Login_Id DEFAULT (newsequentialid()) FOR [Id]
GO
CREATE NONCLUSTERED INDEX IX_Login_ScopedIdentity ON [auth].[Login] ([ScopedIdentity] ASC);
GO


IF OBJECT_ID('auth.sp_UpsertLogin', 'P') IS NOT NULL
    DROP PROCEDURE auth.sp_UpsertLogin;
GO
-- =======================================
-- Author:      Cliff Spital
-- Create date: 2019/7/24
-- Description: Records a Login event from Leaf
-- =======================================
CREATE PROCEDURE auth.sp_UpsertLogin
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
