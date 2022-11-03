// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Compiler;
using Model.Compiler.PanelSqlCompiler;
using Model.Compiler.SqlBuilder;
using Model.Options;
using Services.Compiler.SqlBuilder;

namespace Tests.Mock.Models.Compiler
{
    public static class MockOptions
    {
        static readonly ISqlDialect dialect = new TSqlDialect();
        static readonly IOptions<CompilerOptions> opts = GenerateOmopOptions();

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

        public static PanelSqlCompiler GenerateSqlServerCompiler()
        {
            IOptions<CompilerOptions> compilerOptions = GenerateOmopOptions();

            return new PanelSqlCompiler(new MockUser(), dialect, compilerOptions);
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

            public SessionType SessionType => throw new NotImplementedException();

            public bool Identified { get; }

            public AuthenticationMechanism AuthenticationMechanism => throw new NotImplementedException();

            public bool IsInRole(string role) => throw new NotImplementedException();
        }
    }
}
