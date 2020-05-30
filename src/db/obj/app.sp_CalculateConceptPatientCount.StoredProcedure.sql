-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
﻿USE [LeafDB]
GO
/****** Object:  StoredProcedure [app].[sp_CalculateConceptPatientCount]    Script Date: ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =======================================
-- Author:      Nic Dobbins
-- Create date: 2019/5/23
-- Description: Calculates the patient count for a given concept using
--              dynamic SQL for both the total unique patients and unique 
--              count by year.
-- =======================================
CREATE PROCEDURE [app].[sp_CalculateConceptPatientCount]
	@PersonIdField NVARCHAR(50),
	@TargetDatabaseName NVARCHAR(100),
	@From NVARCHAR(MAX),
	@Where NVARCHAR(MAX),
	@Date NVARCHAR(200),
	@isEncounterBased BIT,
	@CurrentRootId [uniqueidentifier],
	@CurrentConceptId [uniqueidentifier]
AS
BEGIN

	DECLARE @ExecuteSql NVARCHAR(MAX),
			@Result NVARCHAR(MAX),
			@ParameterDefinition NVARCHAR(MAX)= N'@TotalPatientsOUT INT OUTPUT',
			@PatientsByYearParameterDefinition NVARCHAR(MAX)= N'@TotalPatientsByYearOUT NVARCHAR(MAX) OUTPUT'
	
	BEGIN 

			-- Figure out if we need to add the db name
			DECLARE @DbFrom NVARCHAR(100) = @TargetDatabaseName + '.' + @From
			SET @DbFrom = 
				CASE
					WHEN OBJECT_ID(@DbFrom, 'U') IS NULL AND OBJECT_ID(@DbFrom, 'V') IS NULL THEN @From
					ELSE @DbFrom
				END
			
			------------------------------------------------------------------------------------------------------------------------------ 
			-- Total Patient Count
			------------------------------------------------------------------------------------------------------------------------------
			SELECT @ExecuteSql = 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;  
			
							      SELECT @TotalPatientsOUT = (SELECT COUNT(DISTINCT _T.' + @PersonIdField + ') ' +
															 'FROM ' + @DbFrom + ' AS _T ' +
															  ISNULL('WHERE ' + @Where,'') + 
															')'

			BEGIN TRY 
			
				EXECUTE sp_executesql 
					@ExecuteSql,
					@ParameterDefinition,
					@TotalPatientsOUT = @Result OUTPUT

				UPDATE app.Concept
				SET UiDisplayPatientCount = TRY_PARSE(@Result AS INT)
				  , PatientCountLastUpdateDateTime = GETDATE()
				WHERE Id = @CurrentConceptId

			END TRY 
			
			BEGIN CATCH 

				PRINT('Failed to run query for ' + CONVERT(NVARCHAR(50),@CurrentConceptId));
				PRINT('Failed query: ' + @ExecuteSql);
				PRINT('Error: ' + ERROR_MESSAGE())
				PRINT('')

			END CATCH

			------------------------------------------------------------------------------------------------------------------------------ 
			-- Patient Count by Year
			------------------------------------------------------------------------------------------------------------------------------
			IF (@isEncounterBased = 1 AND TRY_CONVERT(INT, @Result) > 0)
			
				BEGIN
				
					-- Output to the @TotalPatientsByYear (JSON) parameter to log the result
					SET @ExecuteSql = 
								'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;  
								 
								 WITH year_calculation AS
									  (SELECT PatientYear = CONVERT(NVARCHAR(10),YEAR(' + @Date + '))
											, _T.' + @PersonIdField +'
									   FROM ' + @DbFrom + ' AS _T ' + 
									   ISNULL('WHERE ' + @Where,'') + ')
									  
									, year_grouping AS
									  (SELECT PatientYear
											, PatientCount = COUNT(DISTINCT ' + @PersonIdField + ')
									   FROM year_calculation
									   GROUP BY PatientYear)
								SELECT @TotalPatientsByYearOUT = (' + 
										 '''['' + STUFF(
		  										(SELECT ''{"Year":'' + PatientYear + '',"PatientCount":'' + CONVERT(NVARCHAR(20),PatientCount) + ''},'' 
		  										 FROM year_grouping
												 WHERE PatientCount > 0
												 ORDER BY PatientYear
		  										 FOR XML PATH(''''), TYPE).value(''text()[1]'', ''varchar(MAX)''
												 ), 1, 0, '''') +
										'']'')'
	
					BEGIN TRY 
						
						EXECUTE sp_executesql 
							@ExecuteSql,
							@PatientsByYearParameterDefinition,
							@TotalPatientsByYearOUT = @Result OUTPUT

						-- Clean up JSON by removing last unnecessary comma
						SET @Result = LEFT(@Result, LEN(@Result) - 2) + ']'

						UPDATE app.Concept
						SET UiDisplayPatientCountByYear = @Result
						WHERE Id = @CurrentConceptId

					END TRY 
			
					BEGIN CATCH 
			
						PRINT('Failed to run query for ' + CONVERT(NVARCHAR(50),@CurrentConceptId));
						PRINT('Failed query: ' + @ExecuteSql);
						PRINT('Error: ' + ERROR_MESSAGE())
						PRINT('')

					END CATCH

				END

		END 

END
GO
