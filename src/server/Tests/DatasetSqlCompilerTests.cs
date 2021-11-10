// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Compiler;
using Model.Compiler.SqlServer;
using Model.Options;
using Services.Startup;
using Xunit;

namespace Tests
{
    public class DatasetSqlCompilerTests
    {
        static readonly DatabaseExtractor extractor = new DatabaseExtractor();

        [Fact]
        public void Should_Correctly_Represent_Observation_Shape()
        {
            var compilerCtx = GetObservationCompilerContext();
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Equal(Shape.Observation, executionCtx.Shape);
        }

        [Fact]
        public void Should_Correctly_Represent_Encounter_Shape()
        {
            var compilerCtx = GetEncounterCompilerContext();
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Equal(Shape.Encounter, executionCtx.Shape);
        }

        [Fact]
        public void Should_Correctly_Reference_AppDb()
        {
            var compilerCtx = GetEncounterCompilerContext();
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Contains("LeafDB", executionCtx.CompiledQuery);
        }

        [Fact]
        public void Should_Correctly_Reference_QueryId_Parameter()
        {
            var compilerCtx = GetEncounterCompilerContext();
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Contains(ShapedDatasetCompilerContext.QueryIdParam, executionCtx.CompiledQuery);
            Assert.Contains(executionCtx.Parameters, p => p.Name == ShapedDatasetCompilerContext.QueryIdParam && p.Value.Equals(compilerCtx.QueryContext.QueryId));
        }

        [Fact]
        public void Observation_Should_Correctly_Reference_LateBound_Parameter()
        {
            var compilerCtx = GetObservationCompilerContext();
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Contains(ObservationColumns.EffectiveDate, executionCtx.CompiledQuery);
            Assert.Contains(executionCtx.Parameters, p => p.Name == "@late");
        }

        [Fact]
        public void Encounter_Should_Correctly_Reference_LateBound_Parameter()
        {
            var compilerCtx = GetEncounterCompilerContext();
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Contains(EncounterColumns.AdmitDate, executionCtx.CompiledQuery);
            Assert.Contains(executionCtx.Parameters, p => p.Name == "@late");
        }

        [Fact]
        public void Observation_Should_Correctly_Reference_EarlyBound_And_LateBound_Parameter()
        {
            var compilerCtx = GetObservationCompilerContext(early: true);
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Contains(ObservationColumns.EffectiveDate, executionCtx.CompiledQuery);
            Assert.Contains(executionCtx.Parameters, p => p.Name == "@early");
            Assert.Contains(executionCtx.Parameters, p => p.Name == "@late");
        }

        [Fact]
        public void Encounter_Should_Correctly_Reference_EarlyBound_And_LateBound_Parameter()
        {
            var compilerCtx = GetEncounterCompilerContext(early: true, late: true);
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            var executionCtx = compiler.BuildDatasetSql(compilerCtx);

            Assert.Contains(EncounterColumns.AdmitDate, executionCtx.CompiledQuery);
            Assert.Contains(executionCtx.Parameters, p => p.Name == "@early");
            Assert.Contains(executionCtx.Parameters, p => p.Name == "@late");
        }

        [Fact]
        public void Should_Throw_If_Sql_Contains_Illegal_Command()
        {
            var compilerCtx = GetEncounterCompilerContext();
            compilerCtx.DatasetQuery.SqlStatement = "DROP TABLE encounter";
            var compiler = new DatasetSqlCompiler(GetSqlCompiler(), GetCompilerOptions());

            Assert.Throws<LeafCompilerException>(() => compiler.BuildDatasetSql(compilerCtx));
        }

        static DatasetCompilerContext GetObservationCompilerContext(bool early = false, bool late = false)
        {
            var (earlyBound, lateBound) = GetDateFilterBounds(early, late);

            return new DatasetCompilerContext
            {
                DatasetQuery = new DatasetQuery
                {
                    Id = Guid.NewGuid(),
                    Shape = Shape.Observation,
                    Name = "Test Observation",
                    SqlStatement = "SELECT personId, encounterId, category, code, effectiveDate, valueString FROM v_test_observation"
                },
                QueryContext = new QueryContext
                {
                    QueryId = Guid.NewGuid(),
                    Pepper = Guid.NewGuid()
                },
                EarlyBound = earlyBound,
                LateBound = lateBound
            };
        }

        static (DateTime?, DateTime?) GetDateFilterBounds(bool early, bool late)
        {
            DateTime? earlyBound = null;
            DateTime? lateBound = null;
            if (early)
            {
                earlyBound = new DateTime(2015, 2, 15, 13, 15, 00);
            }

            if (late)
            {
                lateBound = new DateTime(2018, 12, 1, 13, 15, 00);
            }
            return (earlyBound, lateBound);
        }

        static DatasetCompilerContext GetEncounterCompilerContext(bool early = false, bool late = false)
        {
            var (earlyBound, lateBound) = GetDateFilterBounds(early, late);

            return new DatasetCompilerContext
            {
                DatasetQuery = new DatasetQuery
                {
                    Id = Guid.NewGuid(),
                    Shape = Shape.Encounter,
                    Name = "Test Encounter",
                    SqlStatement = "SELECT personId, encounterId, admitDate, class, dischargeDate, location FROM v_test_encounter"
                },
                QueryContext = new QueryContext
                {
                    QueryId = Guid.NewGuid(),
                    Pepper = Guid.NewGuid()
                },
                EarlyBound = earlyBound,
                LateBound = lateBound
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

        static ISqlCompiler GetSqlCompiler()
        {
            var compOpts = GetCompilerOptions();
            var user = new MockUser();
            var cohortOpts = Options.Create(new CohortOptions());
            return new SqlServerCompiler(user, compOpts, cohortOpts);
        }

        class MockUser : IUserContext
        {
            public MockUser(bool id = false, bool quar = false, bool ins = true)
            {
                IsInstitutional = ins;
                Identified = id;
                IsQuarantined = quar;
            }

            public string[] Groups => throw new NotImplementedException();

            public string[] Roles => throw new NotImplementedException();

            public string Issuer => throw new NotImplementedException();

            public string UUID => throw new NotImplementedException();

            public string Identity => throw new NotImplementedException();

            public bool IsInstitutional { get; }

            public bool IsAdmin => throw new NotImplementedException();

            public bool IsQuarantined { get; }

            public Guid IdNonce => throw new NotImplementedException();

            public Guid? SessionNonce => throw new NotImplementedException();

            public SessionType SessionType => SessionType.Research;

            public bool Identified { get; set; }

            public AuthenticationMechanism AuthenticationMechanism => throw new NotImplementedException();

            public bool IsInRole(string role) => throw new NotImplementedException();
        }
    }
}
