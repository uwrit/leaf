-- Copyright (c) 2021, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [adm].[sp_CreateDynamicDatasetQuery]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/7/22
-- Description: Create a dynamic datasetquery.
-- =======================================
CREATE PROCEDURE [adm].[sp_CreateDynamicDatasetQuery]
	@shape INT,
    @name nvarchar(200),
    @catid int,
    @desc nvarchar(max),
    @sql nvarchar(4000),
	@isEnc bit,
	@schema nvarchar(max),
	@sqlDate nvarchar(1000) = NULL,
	@sqlValString nvarchar(1000) = NULL,
	@sqlValNum nvarchar(1000) = NULL,
    @tags app.DatasetQueryTagTable READONLY,
    @constraints auth.ResourceConstraintTable READONLY,
    @user auth.[User]
AS
BEGIN
    SET NOCOUNT ON
    
    IF (app.fn_NullOrWhitespace(@name) = 1)
        THROW 70400, N'DatasetQuery.Name is required.', 1;

    IF (app.fn_NullOrWhitespace(@sql) = 1)
        THROW 70400, N'DatasetQuery.SqlStatement is required.', 1;

	IF (app.fn_NullOrWhitespace(@schema) = 1)
        THROW 70400, N'DatasetQuery.Schema is required.', 1;
    
    BEGIN TRAN;
    BEGIN TRY

        DECLARE @ins1 TABLE (
            [Id] uniqueidentifier,
			[Shape] int not null,
            [Name] nvarchar(200) not null,
            [CategoryId] int null,
            [Description] nvarchar(max) null,
            [SqlStatement] nvarchar(4000) not null,
			[Schema] nvarchar(max) null,
			[IsEncounterBased] bit null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
			[SqlFieldValueNumeric] nvarchar(1000) null,
            [Created] datetime not null,
            [CreatedBy] nvarchar(1000) not null,
            [Updated] datetime not null,
            [UpdatedBy] nvarchar(1000) not null
        );

		DECLARE @ins2 TABLE (
            [Id] uniqueidentifier,
			[Schema] nvarchar(max) null,
			[IsEncounterBased] bit null,
			[SqlFieldDate] nvarchar(1000) null,
			[SqlFieldValueString] nvarchar(1000) null,
			[SqlFieldValueNumeric] nvarchar(1000) null
        );

		INSERT INTO app.DatasetQuery ([Shape], [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        OUTPUT
            inserted.Id,
			inserted.Shape,
            inserted.[Name],
            inserted.CategoryId,
            inserted.[Description],
            inserted.SqlStatement,
            inserted.Created,
            inserted.CreatedBy,
            inserted.Updated,
            inserted.UpdatedBy
        INTO @ins1 ([Id], [Shape], [Name], CategoryId, [Description], SqlStatement, Created, CreatedBy, Updated, UpdatedBy)
        VALUES (@shape, @name, @catid, @desc, @sql, GETDATE(), @user, GETDATE(), @user);

		DECLARE @id UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM @ins1);

        INSERT INTO app.DynamicDatasetQuery ([Id], [Schema], IsEncounterBased, SqlFieldDate, SqlFieldValueString, SqlFieldValueNumeric)
		OUTPUT
            inserted.Id,
			inserted.[Schema],
			inserted.[IsEncounterBased],
			inserted.[SqlFieldDate],
			inserted.[SqlFieldValueString],
			inserted.[SqlFieldValueNumeric]
        INTO @ins2 ([Id], [Schema], [IsEncounterBased], [SqlFieldDate], [SqlFieldValueString], [SqlFieldValueNumeric])
        VALUES (@id, @schema, @isEnc, @sqlDate, @sqlValString, @sqlValNum);

		UPDATE @ins1
		SET [Schema] = i2.[Schema]
		  , [IsEncounterBased] = i2.[IsEncounterBased]
		  , [SqlFieldDate] = i2.[SqlFieldDate]
		  , [SqlFieldValueString] = i2.[SqlFieldValueString]
		  , [SqlFieldValueNumeric] = i2.[SqlFieldValueNumeric]
		FROM @ins2 AS i2
        
        SELECT
            [Id],
			[Shape],
            [Name],
            [CategoryId],
            [Description],
            [SqlStatement],
			[Schema],
			[IsEncounterBased],
			[SqlFieldDate],
			[SqlFieldValueString],
			[SqlFieldValueNumeric],
            [Created],
            [CreatedBy],
            [Updated],
            [UpdatedBy]
        FROM @ins1;

        INSERT INTO app.DatasetQueryTag (DatasetQueryId, Tag)
        OUTPUT inserted.DatasetQueryId, inserted.Tag
        SELECT @id, Tag
        FROM @tags;

        INSERT INTO auth.DatasetQueryConstraint (DatasetQueryId, ConstraintId, ConstraintValue)
        OUTPUT inserted.DatasetQueryId, inserted.ConstraintId, inserted.ConstraintValue
        SELECT @id, ConstraintId, ConstraintValue
        FROM @constraints;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;

END
GO
