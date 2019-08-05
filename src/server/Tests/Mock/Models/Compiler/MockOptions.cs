// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Options;
using Model.Compiler.SqlServer;
using Model.Options;

namespace Tests.Mock.Models.Compiler
{
    public static class MockOptions
    {
        public static IOptions<CompilerOptions> GenerateOmopOptions()
        {
            return Options.Create(new CompilerOptions
            {
                FieldPersonId = "person_id",
                FieldEncounterId = "visit_id",
                Alias = "@"
            });
        }

        public static IOptions<CohortOptions> GenerateCohortOptions()
        {
            return Options.Create(new CohortOptions());
        }

        public static SqlServerCompiler GenerateSqlServerCompiler()
        {
            IOptions<CompilerOptions> compilerOptions = GenerateOmopOptions();
            IOptions<CohortOptions> cohortOptions = GenerateCohortOptions();

            return new SqlServerCompiler(compilerOptions, cohortOptions);
        }
    }
}
