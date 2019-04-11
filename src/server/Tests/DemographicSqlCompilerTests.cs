// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Options;
using Model.Compiler;
using Model.Compiler.SqlServer;
using Model.Options;
using Services.Startup;
using Xunit;

namespace Tests
{
    public class DemographicSqlCompilerTests
    {
        static readonly DatabaseExtractor extractor = new DatabaseExtractor();

        [Fact]
        public void Should_Correctly_Represent_Demographic_Shape()
        {
            var compilerCtx = GetCompilerContext();
            var compiler = new DemographicSqlCompiler(GetCompilerOptions());

            var executionCtx = compiler.BuildDemographicSql(compilerCtx, false);

            Assert.Equal(Shape.Demographic, executionCtx.Shape);
        }

        [Fact]
        public void Should_Correctly_Reference_AppDb()
        {
            var compilerCtx = GetCompilerContext();
            var compiler = new DemographicSqlCompiler(GetCompilerOptions());

            var executionCtx = compiler.BuildDemographicSql(compilerCtx, true);

            Assert.Contains("LeafDB", executionCtx.CompiledQuery);
        }

        [Fact]
        public void Should_Correctly_Reference_QueryId_Parameter()
        {
            var compilerCtx = GetCompilerContext();
            var compiler = new DemographicSqlCompiler(GetCompilerOptions());

            var executionCtx = compiler.BuildDemographicSql(compilerCtx, false);

            Assert.Contains(ShapedDatasetCompilerContext.QueryIdParam, executionCtx.CompiledQuery);
            Assert.Contains(executionCtx.Parameters, p => p.Name == ShapedDatasetCompilerContext.QueryIdParam && p.Value.Equals(compilerCtx.QueryContext.QueryId));
        }

        [Fact]
        public void Should_Correctly_Restrict_Phi_Fields()
        {
            var compilerCtx = GetCompilerContext();
            var compiler = new DemographicSqlCompiler(GetCompilerOptions());

            var executionCtx = compiler.BuildDemographicSql(compilerCtx, true);

            Assert.Contains(executionCtx.FieldSelectors, f => f.Name == DemographicColumns.BirthDate);
            Assert.DoesNotContain(executionCtx.FieldSelectors, f => f.Name == DemographicColumns.Name);
        }

        [Fact]
        public void Should_Correctly_Include_Phi_Fields()
        {
            var compilerCtx = GetCompilerContext();
            var compiler = new DemographicSqlCompiler(GetCompilerOptions());

            var executionCtx = compiler.BuildDemographicSql(compilerCtx, false);

            Assert.Contains(executionCtx.FieldSelectors, f => f.Name == DemographicColumns.Mrn);
            Assert.Contains(executionCtx.FieldSelectors, f => f.Name == DemographicColumns.Name);
        }

        [Fact]
        public void Should_Omit_Additional_Record_Fields()
        {
            var compilerCtx = GetCompilerContext();
            var compiler = new DemographicSqlCompiler(GetCompilerOptions());

            var executionCtx = compiler.BuildDemographicSql(compilerCtx, false);

            Assert.DoesNotContain(executionCtx.FieldSelectors, f => f.Name == DemographicColumns.Exported);
            Assert.DoesNotContain(executionCtx.FieldSelectors, f => f.Name == DatasetColumns.Salt);
        }

        static DemographicCompilerContext GetCompilerContext()
        {
            return new DemographicCompilerContext
            {
                QueryContext = new QueryContext
                {
                    QueryId = Guid.NewGuid(),
                    Pepper = Guid.NewGuid()
                },
                DemographicQuery = new DemographicQuery
                {
                    SqlStatement = @"SELECT personId = cast(p.person_id as nvarchar), addressPostalCode = l.zip, addressState = p.location_state, ethnicity = p.ethnicity, gender = CASE WHEN p.gender = 'F' THEN 'female' WHEN p.gender = 'M' THEN 'male' ELSE 'other' END, [language] = 'Unknown', maritalStatus = 'Unknown', race = p.race, religion = 'Unknown', marriedBoolean = cast(0 as bit), hispanicBoolean = cast(CASE WHEN p.ethnicity_code = 38003563 THEN 1 ELSE 0 END as bit), deceasedBoolean = cast(CASE WHEN p.death_date IS NULL THEN 0 ELSE 1 END as bit), birthDate = p.birth_datetime, deceasedDateTime = p.death_date, [name] = 'Unknown Unknown', mrn = 'abc12345' FROM v_person p JOIN person ps on p.person_id = ps.person_id LEFT JOIN [location] l on ps.location_id = l.location_id"
                }
            };
        }

        static IOptions<CompilerOptions> GetCompilerOptions()
        {
            var dbOpts = new AppDbOptions
            {
                ConnectionString = @"Server=fake;Database=LeafDB;Trusted_Connection=True"
            };
            return Options.Create(new CompilerOptions { AppDb = extractor.ExtractDatabase(dbOpts) });
        }
    }
}
