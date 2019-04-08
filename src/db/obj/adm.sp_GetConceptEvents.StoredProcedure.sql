USE [LeafDB]
GO

/****** Object:  StoredProcedure [adm].[sp_GetConceptSqlSets]    Script Date: 4/8/2019 2:56:53 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/4/8
-- Description: Gets all app.ConceptEvent records.
-- =======================================
CREATE PROCEDURE [adm].[sp_GetConceptEvents]    
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        Id,
        UiDisplayEventName
    FROM
        app.ConceptEvent;
END


GO


