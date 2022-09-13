
/**
 * [app].[Dashboard]
 */
IF OBJECT_ID('app.Dashboard') IS NOT NULL
	DROP TABLE [app].[Dashboard];
GO

CREATE TABLE [app].[Dashboard](
	[Id] [uniqueidentifier] NOT NULL,
	[JsonConfig] [nvarchar](max) NOT NULL,
	[UiDisplayName] [nvarchar](100) NOT NULL,
    [UiDisplayDescription] [nvarchar](1000) NULL,
	Created [datetime] NOT NULL,
    CreatedBy [nvarchar](1000) NOT NULL,
    Updated [datetime] NOT NULL,
    UpdatedBy [nvarchar](1000) NOT NULL
)
GO

ALTER TABLE [app].[Dashboard] ADD  CONSTRAINT [PK_Dashboard_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
GO

CREATE UNIQUE NONCLUSTERED INDEX [IXUniq_UiDisplayName] ON [app].[Dashboard]
(
	[UiDisplayName] ASC
)

ALTER TABLE [app].[Dashboard] ADD  CONSTRAINT [DF_Dashboard_Id]  DEFAULT (newsequentialid()) FOR [Id]
GO
ALTER TABLE [app].[Dashboard] ADD  CONSTRAINT [DF_Dashboard_Created]  DEFAULT (getdate()) FOR [Created]
GO

/*
 * [app].[sp_GetDashboardConfigById]
 */
IF OBJECT_ID('app.sp_GetDashboardConfigById', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetDashboardConfigById];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2022/3/11
-- Description: Gets configuration and metadata for a dashboard
-- =======================================
CREATE PROCEDURE [app].[sp_GetDashboardConfigById]
    @id [uniqueidentifier],
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    SELECT Id, JsonConfig, UiDisplayName, UiDisplayDescription
    FROM app.Dashboard
    WHERE Id = @id

END
GO

/*
 * [app].[sp_GetDashboardConfigs]
 */
IF OBJECT_ID('app.sp_GetDashboardConfigs', 'P') IS NOT NULL
    DROP PROCEDURE [app].[sp_GetDashboardConfigs];
GO

-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2022/3/11
-- Description: Gets configuration and metadata for all dashboards
-- =======================================
CREATE PROCEDURE [app].[sp_GetDashboardConfigs]
    @user auth.[User],
    @groups auth.GroupMembership READONLY,
	@admin bit = 0
AS
BEGIN
    SET NOCOUNT ON

    SELECT Id, JsonConfig, UiDisplayName, UiDisplayDescription
    FROM app.Dashboard

END
GO

/* Test data */
DECLARE @testconfig NVARCHAR(MAX) = '{"main":{"title":"UW Memory and Brain Wellness Dashboard"},"patient":{"search":{"enabled":true},"content":[{"type":"row","content":[{"color":[143,31,177],"icon":"checklist","type":"checklist","title":"Quality Care Checklists","width":44,"datasets":[{"title":"MBWC Quality Measures","id":"f0f1423e-f36b-1410-81bf-0018c8508655","items":["MRI Brain","FDG PET Brain","CSF","Hearing Screening","Vision Screening","Family Conference","Neuropsychology","MoCA","MMSE","In MBWC Program"]}]},{"color":[35,122,35],"icon":"plus","type":"list","title":"Problem List","width":29,"datasetId":"f2f1423e-f36b-1410-81bf-0018c8508655"},{"color":[36,77,138],"icon":"med","type":"list","title":"Active Medications","width":28,"datasetId":"f4f1423e-f36b-1410-81bf-0018c8508655"}]},{"type":"timeline","title":"Clinical Course Timeline","comparison":{"enabled":true,"columnText":"All MBWC Patients","title":"MWBC Population Comparison"},"export":{"enabled":true},"eventDatasets":[{"color":[153,18,194],"icon":"plus","id":"ebf1423e-f36b-1410-81bf-0018c8508655"},{"color":[197,118,14],"icon":"person","id":"9803433e-f36b-1410-81c7-0018c8508655"},{"color":[192,31,45],"id":"9a03433e-f36b-1410-81c7-0018c8508655"},{"color":[41,75,226],"icon":"med","id":"a103433e-f36b-1410-81c7-0018c8508655"}],"numericDatasets":[{"title":"Body weight (lbs)","color":[41,75,226],"id":"d6f1423e-f36b-1410-81bf-0018c8508655"},{"title":"PHQ9 score","color":[57,181,238],"id":"d9f1423e-f36b-1410-81bf-0018c8508655"},{"title":"MoCA score","color":[153,18,194],"id":"e0f1423e-f36b-1410-81bf-0018c8508655"},{"title":"NPI Severity","color":[197,118,14],"id":"e3f1423e-f36b-1410-81bf-0018c8508655"},{"title":"# Intact iADLs","color":[16,180,24],"id":"e6f1423e-f36b-1410-81bf-0018c8508655"}]}]}}'
INSERT INTO app.Dashboard(JsonConfig, UiDisplayName, Created, CreatedBy, Updated, UpdatedBy)
SELECT @testconfig, 'UW Memory and Brain Wellness Dashboard', GETDATE(), 'ndobb', GETDATE(), 'ndobb'
