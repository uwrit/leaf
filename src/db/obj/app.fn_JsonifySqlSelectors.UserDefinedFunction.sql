-- Copyright (c) 2022, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
USE [LeafDB]
GO
/****** Object:  UserDefinedFunction [app].[fn_JsonifySqlSelectors]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =======================================
-- Author:      Cliff Spital
-- Create date: 2018/8/17
-- Description: Converts two app.SqlSelectors into the JSON string.
-- =======================================
CREATE FUNCTION [app].[fn_JsonifySqlSelectors]
(
    @fields app.SqlSelectors READONLY
)
RETURNS nvarchar(4000)
AS
BEGIN
    DECLARE @fs nvarchar(4000) = N'{"fields":[';

    DECLARE @Column nvarchar(100), @Type nvarchar(20), @Phi bit, @Mask bit;
    DECLARE ColumnCursor CURSOR FOR
    SELECT [Column], [Type], Phi, Mask
    FROM @fields;


    OPEN ColumnCursor;
    FETCH NEXT FROM ColumnCursor
    INTO @Column, @Type, @Phi, @Mask;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @bphi nvarchar(5) = CASE WHEN @Phi = 1 THEN N'true' ELSE N'false' END;
        DECLARE @bmask nvarchar(5) = CASE WHEN @Mask = 1 THEN N'true' ELSE N'false' END;

        DECLARE @single nvarchar(500) = N'{"column":"' + @Column + '","type":"' + LOWER(@Type) + '","phi":' + @bphi + ',"mask":' + @bmask + '},';
        SET @fs = @fs + @single;

        FETCH NEXT FROM ColumnCursor
        INTO @Column, @Type, @Phi, @Mask;
    END;

    CLOSE ColumnCursor;
    DEALLOCATE ColumnCursor;

    SET @fs = SUBSTRING(@fs, 0, LEN(@fs)) + N']}';

    RETURN @fs;
END











GO
