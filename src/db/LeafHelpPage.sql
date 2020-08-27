USE LeafDB
GO

/* Create help page category table */
CREATE TABLE [LeafDB].[app].[HelpPageCategory] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Category NVARCHAR(255) NOT NULL
)
GO

/* Insert rows into help page category table */
INSERT INTO [LeafDB].[app].[HelpPageCategory] (Category) VALUES ('Run Query');
INSERT INTO [LeafDB].[app].[HelpPageCategory] (Category) VALUES ('Export and Save');
INSERT INTO [LeafDB].[app].[HelpPageCategory] (Category) VALUES ('FAQ');
GO

/* Create help pages table */
CREATE TABLE [LeafDB].[app].[HelpPages] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES [LeafDB].[app].[HelpPageCategory](Id),
    Title NVARCHAR(400) NOT NULL
)
GO

/* Insert rows into help pages table */
INSERT INTO [LeafDB].[app].[HelpPages] (CategoryId, Title) VALUES (2, 'PAGE 1');
INSERT INTO [LeafDB].[app].[HelpPages] (CategoryId, Title) VALUES (2, 'PAGE 2');
INSERT INTO [LeafDB].[app].[HelpPages] (CategoryId, Title) VALUES (3, 'PAGE 1');
GO

/* Create help page content table */
CREATE TABLE [LeafDB].[app].[HelpPageContent] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PageId INT NOT NULL FOREIGN KEY REFERENCES [LeafDB].[app].[HelpPages](Id),
    OrderId INT NOT NULL,
    Type NVARCHAR(255) NOT NULL, -- text or image
    TextContent NVARCHAR(MAX) NULL,
    ImageContent VARBINARY(MAX) NULL, -- BINARY
    ImageId NVARCHAR(255) NULL -- maybe ImageTitle?
)
GO

/* Insert rows into help page content table */
INSERT LeafDB.app.HelpPageContent (PageId, OrderId, Type, TextContent) VALUES (1, 1, 'Text', 'Page 1 content.');
INSERT LeafDB.app.HelpPageContent (PageId, OrderId, Type, TextContent) VALUES (1, 2, 'Text', 'Page 1 content continued....');
INSERT LeafDB.app.HelpPageContent (PageId, OrderId, Type, TextContent) VALUES (3, 1, 'Text', 'Page 1 content.');
-- Insert image
INSERT LeafDB.app.HelpPageContent (PageId, OrderId, Type, ImageContent, ImageId) VALUES (3, 2, 'Image', (SELECT * FROM OPENROWSET(BULK '/tmp/test.jpeg', SINGLE_BLOB) AS T), 'Example_Image_1');
GO

/*
 * STEPS TO CREATE CONTENT
 * 1. See if category exists, else create it
 * 2. Create page and select the category it belongs to
 * 3. Create content and select the page it belongs to
 */

-- adding images to db
-- docker cp /Users/mehadi/Desktop/test.jpeg 44ec7b9574fb:/tmp



/* Stored Procedures Created */

-- 1.
-- =======================================
-- Author:      Mehadi Hassan
-- Create date: 2020/08/06 (August 06, 2020)
-- Description: Gets all columns from app.HelpPages.
-- =======================================

-- CREATE PROCEDURE [app].[sp_GetHelpPages]
-- AS
-- BEGIN
--     SET NOCOUNT ON
--     SELECT
--         Id,
--         CategoryId,
--         Title
--     FROM app.HelpPages
--     END
-- GO

-- 2.
-- =======================================
-- Author:      Mehadi Hassan
-- Create date: 2020/08/06 (August 06, 2020)
-- Description: Gets help page content by page id from app.HelpPageContent.
-- =======================================

-- CREATE PROCEDURE [app].[sp_GetHelpPageContentByPageId]
--     @pageId int
-- AS
-- BEGIN
--     SET NOCOUNT ON
--     -- Need to throw error/message if page does not exist.
--     IF ((SELECT COUNT(*) FROM app.HelpPageContent hpc WHERE hpc.PageId = @pageId) = 0)
--         THROW 70404, 'Page not found and/or does not exist.', 1;
--     SELECT
--         hpc.PageId,
--         hpc.OrderId,
--         hpc.Type,
--         hpc.TextContent,
--         hpc.ImageContent,
--         hpc.ImageId
--     FROM
--         app.HelpPageContent hpc
--     WHERE
--         hpc.PageId = @pageId;
-- END
-- GO

-- 3.
-- =======================================
-- Author:      Mehadi Hassan
-- Create date: 2020/08/07 (August 07, 2020)
-- Description: Creates a help page in app.HelpPages.
-- =======================================

-- CREATE PROCEDURE [adm].[sp_CreateHelpPage]
--     @title nvarchar(400),
--     @categoryName nvarchar(255),
--     @orderId int,
--     @type nvarchar(255),
--     @textContent nvarchar(max),
--     @imageContent varbinary(max),
--     @imageId nvarchar(255),
--     @user auth.[User]
-- AS
-- BEGIN
--     DECLARE @categoryId int
--     SET @categoryId = (SELECT Id FROM app.HelpPageCategory WHERE Category = @categoryName)
--     IF (@orderId = 1) AND EXISTS(SELECT 1 FROM app.HelpPages hp WHERE hp.Title = @title AND hp.CategoryId = @categoryId)
--         THROW 70409, N'Page title and category already exist.', 1;
--     IF (@categoryName IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.HelpPageCategory hpc WHERE hpc.Category = @categoryName))
--         INSERT INTO app.HelpPageCategory (Category) SELECT Category = @categoryName
--     IF (@orderId = 1)
--     BEGIN;
--         INSERT INTO app.HelpPages (
--             Title,
--             CategoryId
--         )
--         OUTPUT inserted.Id, inserted.CategoryId, inserted.Title
--         SELECT
--             Title = @title,
--             CategoryId = (SELECT Id FROM app.HelpPageCategory hpc WHERE hpc.Category = @categoryName)
--     END;
--     INSERT INTO app.HelpPageContent (
--         PageId,
--         OrderId,
--         Type,
--         TextContent,
--         ImageContent,
--         ImageId
--     )
--     OUTPUT inserted.Id, inserted.PageId, inserted.OrderId, inserted.Type, inserted.TextContent, inserted.ImageContent, inserted.ImageId
--     SELECT
--         PageId = (SELECT Id FROM app.HelpPages WHERE Title = @title AND CategoryId = @categoryId),
--         OrderId = @orderId,
--         Type = @type,
--         TextContent = @textContent,
--         ImageContent = @imageContent,
--         ImageId = @imageId
-- END

-- 4.
-- =======================================
-- Author:      Mehadi Hassan
-- Create date: 2020/08/26 (August 26, 2020)
-- Description: Deletes help page in app.HelpPages and content in app.HelpPageContent.
-- =======================================

-- CREATE PROCEDURE [adm].[sp_DeleteHelpPageAndContent]
--     @pageId int,
--     @user auth.[User]
-- AS
-- BEGIN
--     DECLARE @categoryId int
--     SET @categoryId = (SELECT CategoryId FROM app.HelpPages hp WHERE hp.Id = @pageId)
--     IF (NOT EXISTS(SELECT 1 FROM app.HelpPages hp WHERE hp.Id = @pageId))
--     BEGIN;
--         THROW 70404, N'Could not find page and/or does not exist.', 1;
--     END;
--     DELETE FROM app.HelpPageContent
--     WHERE PageId = @pageId
--     DELETE FROM app.HelpPages
--     WHERE Id = @pageId
--     IF ((SELECT COUNT(*) FROM app.HelpPages WHERE CategoryId = @categoryId) = 0)
--     BEGIN;
--         DELETE FROM app.HelpPageCategory
--         WHERE Id = @categoryId
--     END;
-- END
-- GO

-- 5.
-- =======================================
-- Author:      Mehadi Hassan
-- Create date: 2020/08/27 (August 27, 2020)
-- Description: Updates help page in app.HelpPages and content in app.HelpPageContent.
-- =======================================

-- CREATE PROCEDURE [adm].[sp_UpdateHelpPageAndContent]
--     @pageId int,
--     @categoryName nvarchar(255),
--     @title nvarchar(400),
--     @orderId int,
--     @type nvarchar(255),
--     @textContent nvarchar(max),
--     @imageContent varbinary(max),
--     @imageId nvarchar(255),
--     @user auth.[User]
-- AS
-- BEGIN
--     DECLARE @categoryId int
--     SET @categoryId = (SELECT Id FROM app.HelpPageCategory WHERE Category = @categoryName)
--     IF NOT EXISTS(SELECT 1 FROM app.HelpPages hp WHERE hp.Id = @pageId)
--         THROW 70404, N'Could not find page and/or does not exist.', 1;
--     IF NOT EXISTS(SELECT 1 FROM app.HelpPageCategory hpc WHERE hpc.Category = @categoryName)
--         THROW 70404, N'Could not find category and/or does not exist.', 1;
--     IF EXISTS(SELECT 1 FROM app.HelpPages hp WHERE hp.Title = @title AND hp.CategoryId = @categoryId)
--         THROW 70409, N'Page title and category already exist.', 1;
--     IF (app.fn_NullOrWhitespace(@title) = 1)
--         THROW 70400, N'Title is required.', 1;
--     IF (app.fn_NullOrWhitespace(@categoryName) = 1)
--         THROW 70400, N'Category is required.', 1;
--     IF (app.fn_NullOrWhitespace(@orderId) = 1)
--         THROW 70400, N'Page order number is required.', 1;
--     IF (app.fn_NullOrWhitespace(@type) = 1)
--         THROW 70400, N'Content type is required.', 1;
--     UPDATE app.HelpPages
--     SET
--         Title = @title
--       , CategoryId = (SELECT Id FROM app.HelpPageCategory WHERE Category = @categoryName)
--     OUTPUT inserted.Id, inserted.CategoryId, inserted.Title
--     WHERE Id = @pageId
--     UPDATE app.HelpPageContent
--     SET
--         OrderId = @orderId
--       , Type = @type
--       , TextContent = @textContent
--       , ImageContent = @imageContent
--       , ImageId = @imageId
--     OUTPUT inserted.Id, inserted.PageId, inserted.OrderId, inserted.Type, inserted.TextContent, inserted.ImageContent, inserted.ImageId
--     WHERE PageId = @pageId AND OrderId = @orderId
-- END
-- GO

-- 6.
-- =======================================
-- Author:      Mehadi Hassan
-- Create date: 2020/08/27 (August 27, 2020)
-- Description: Gets help pages in app.HelpPages and content in app.HelpPageContent.
-- =======================================

-- CREATE PROCEDURE [adm].[sp_GetHelpPageAndContent]
--     @pageId int,
--     @user auth.[User]
-- AS
-- BEGIN
--     IF NOT EXISTS(SELECT 1 FROM app.HelpPages hp WHERE hp.Id = @pageId)
--         THROW 70404, N'Could not find page and/or does not exist.', 1;
--     SELECT Title
--     FROM app.HelpPages
--     WHERE Id = @pageId
--     SELECT Category
--     FROM app.HelpPageCategory
--     WHERE Id = (SELECT CategoryId FROM app.HelpPages hp WHERE hp.Id = @pageId)
--     SELECT
--         OrderId
--       , Type
--       , TextContent
--       , ImageContent
--       , ImageId
--     FROM app.HelpPageContent
--     WHERE PageId = @pageId
-- END
-- GO

