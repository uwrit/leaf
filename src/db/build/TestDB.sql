USE [master]
GO

/**
 * TestDB
 */
CREATE DATABASE [TestDB]
GO

ALTER DATABASE [TestDB] SET RECOVERY SIMPLE
GO

USE [TestDB]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[person](
	[person_id] [int] NULL,
	[age] [int] NULL,
	[gender] [nvarchar](20) NULL
) ON [PRIMARY]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[visit_occurrence](
	[person_id] [int] NULL,
	[visit_occurrence_id] [int] NULL,
	[visit_date] [datetime] NULL,
	[visit_type] [nvarchar](10) NULL
) ON [PRIMARY]
GO

INSERT [dbo].[person] ([person_id], [age], [gender]) VALUES (1, 28, N'F')
GO
INSERT [dbo].[person] ([person_id], [age], [gender]) VALUES (2, 74, N'M')
GO
INSERT [dbo].[person] ([person_id], [age], [gender]) VALUES (3, 55, N'M')
GO
INSERT [dbo].[person] ([person_id], [age], [gender]) VALUES (4, 43, N'F')
GO
INSERT [dbo].[person] ([person_id], [age], [gender]) VALUES (5, 99, N'F')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (1, 100, CAST(N'2020-08-14T00:00:00.000' AS DateTime), N'IP')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (1, 101, CAST(N'2020-09-22T00:00:00.000' AS DateTime), N'OP')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (2, 102, CAST(N'2018-06-01T00:00:00.000' AS DateTime), N'IP')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (2, 103, CAST(N'2018-02-28T00:00:00.000' AS DateTime), N'ED')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (3, 104, CAST(N'2015-01-01T00:00:00.000' AS DateTime), N'OP')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (4, 105, CAST(N'2022-09-19T00:00:00.000' AS DateTime), N'OP')
GO
INSERT [dbo].[visit_occurrence] ([person_id], [visit_occurrence_id], [visit_date], [visit_type]) VALUES (4, 106, CAST(N'2028-01-01T00:00:00.000' AS DateTime), N'IP')
GO

USE [LeafDB]
GO


DECLARE @user NVARCHAR(20) = 'TestDB.sql'
DECLARE @yes BIT = 1
DECLARE @no  BIT = 0

INSERT INTO app.ConceptSqlSet (SqlSetFrom, IsEncounterBased, IsEventBased, SqlFieldDate, Created, CreatedBy, Updated, UpdatedBy)
SELECT *
FROM (VALUES ('dbo.person',               @no,  @no,  NULL,          GETDATE(), @user, GETDATE(), @user),                          
             ('dbo.visit_occurrence',     @yes, @no, '@.visit_date', GETDATE(), @user, GETDATE(), @user)
     ) AS X(col1,col2,col3,col4,col5,col6,col7,col8)

DECLARE @sqlset_person           INT = (SELECT TOP 1 Id FROM LeafDB.app.ConceptSqlSet WHERE SqlSetFrom = 'dbo.person')
DECLARE @sqlset_visit_occurrence INT = (SELECT TOP 1 Id FROM LeafDB.app.ConceptSqlSet WHERE SqlSetFrom = 'dbo.visit_occurrence')

INSERT INTO app.Concept (ExternalId, ExternalParentId, [IsNumeric], IsParent, IsRoot, SqlSetId, SqlSetWhere, 
                         SqlFieldNumeric, UiDisplayName, UiDisplayText, UiDisplayUnits, UiNumericDefaultText, UiDisplayPatientCount)
SELECT ExternalId            = 'A'
     , ExternalParentId      = NULL
     , [IsNumeric]           = @no
     , IsParent              = @yes
     , IsRoot                = @yes
     , SqlSetId              = @sqlset_person
     , SqlSetWhere           = NULL
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Demographics'
     , UiDisplayText         = 'Have demographics'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount  = (SELECT COUNT(*) FROM TestDB.dbo.person)
UNION ALL                          
SELECT ExternalId            = 'A1'
     , ExternalParentId      = 'A'
     , [IsNumeric]           = @no
     , IsParent              = @yes
     , IsRoot                = @no
     , SqlSetId              = @sqlset_person
     , SqlSetWhere           = '@.gender IS NOT NULL'
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Gender'
     , UiDisplayText         = 'Identify with a gender'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.person)
UNION ALL    
SELECT ExternalId            = 'A11'
     , ExternalParentId      = 'A1'
     , [IsNumeric]           = @no
     , IsParent              = @no
     , IsRoot                = @no
     , SqlSetId              = @sqlset_person
     , SqlSetWhere           = '@.gender = ''F'''
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Female'
     , UiDisplayText         = 'Identify as Female'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.person WHERE gender = 'F')
UNION ALL                          
SELECT ExternalId            = 'A12'
     , ExternalParentId      = 'A1'
     , [IsNumeric]           = @no
     , IsParent              = @no
     , IsRoot                = @no
     , SqlSetId              = @sqlset_person
     , SqlSetWhere           = '@.gender = ''M'''
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Male'
     , UiDisplayText         = 'Identify as Male'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.person WHERE gender = 'M')
UNION ALL                          
SELECT ExternalId            = 'A2'
     , ExternalParentId      = 'A'
     , [IsNumeric]           = @yes
     , IsParent              = @no
     , IsRoot                = @no
     , SqlSetId              = @sqlset_person
     , SqlSetWhere           = '@.age IS NOT NULL'
     , SqlFieldNumeric       = '@.age'
     , UiDisplayName         = 'Age'
     , UiDisplayText         = 'Are currently'
     , UiDisplayUnits        = 'years of age'
     , UiNumericDefaultText  = 'any age'
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.person WHERE age IS NOT NULL)
UNION ALL                          
SELECT ExternalId            = 'B'
     , ExternalParentId      = NULL
     , [IsNumeric]           = @no
     , IsParent              = @yes
     , IsRoot                = @yes
     , SqlSetId              = @sqlset_visit_occurrence
     , SqlSetWhere           = NULL
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Encounters'
     , UiDisplayText         = 'Had an encounter'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.visit_occurrence)     
UNION ALL                          
SELECT ExternalId            = 'B1'
     , ExternalParentId      = 'B'
     , [IsNumeric]           = @no
     , IsParent              = @no
     , IsRoot                = @no
     , SqlSetId              = @sqlset_visit_occurrence
     , SqlSetWhere           = NULL
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Inpatient'
     , UiDisplayText         = 'Had an Inpatient encounter'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.visit_occurrence WHERE visit_type = 'IP')     
UNION ALL     
SELECT ExternalId            = 'B2'
     , ExternalParentId      = 'B'
     , [IsNumeric]           = @no
     , IsParent              = @no
     , IsRoot                = @no
     , SqlSetId              = @sqlset_visit_occurrence
     , SqlSetWhere           = NULL
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Outpatient'
     , UiDisplayText         = 'Had an Outpatient encounter'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.visit_occurrence WHERE visit_type = 'OP')     
UNION ALL     
SELECT ExternalId            = 'B3'
     , ExternalParentId      = 'B'
     , [IsNumeric]           = @no
     , IsParent              = @no
     , IsRoot                = @no
     , SqlSetId              = @sqlset_visit_occurrence
     , SqlSetWhere           = NULL
     , SqlFieldNumeric       = NULL
     , UiDisplayName         = 'Emergency'
     , UiDisplayText         = 'Had an Emergency Department encounter'
     , UiDisplayUnits        = NULL
     , UiNumericDefaultText  = NULL
     , UiDisplayPatientCount = (SELECT COUNT(*) FROM TestDB.dbo.visit_occurrence WHERE visit_type = 'ED')     



/**
* Set ParentId based on ExternalIds
*/
UPDATE LeafDB.app.Concept
SET ParentId = P.Id
FROM LeafDB.app.Concept AS C
    INNER JOIN (SELECT P.Id, P.ParentId, P.ExternalId
                FROM LeafDB.app.Concept AS P) AS P
                    ON C.ExternalParentID = P.ExternalID
WHERE C.ParentId IS NULL

/**
* Set RootIds
*/
; WITH roots AS
(
    SELECT RootId            = C.Id
        , RootUiDisplayName = C.UiDisplayName
        , C.IsRoot
        , C.Id
        , C.ParentId
        , C.UiDisplayName
    FROM LeafDB.app.Concept AS C
    WHERE C.IsRoot = 1
    UNION ALL
    SELECT roots.RootId
        , roots.RootUiDisplayName
        , C2.IsRoot
        , C2.Id
        , C2.ParentId
        , C2.UiDisplayName
    FROM roots
        INNER JOIN LeafDB.app.Concept AS C2
            ON C2.ParentId = roots.Id
)
UPDATE LeafDB.app.Concept
SET RootId = roots.RootId
FROM LeafDB.app.Concept AS C
    INNER JOIN roots
        ON C.Id = roots.Id
WHERE C.RootId IS NULL
