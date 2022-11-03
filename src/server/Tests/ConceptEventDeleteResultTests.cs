// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using Model.Admin.Compiler;
namespace Tests
{
    public class ConceptEventDeleteResultTests
    {
        [Fact]
        public void Ok_Is_True_When_There_Are_No_ConceptSqlSetDependents()
        {
            var conceptEventDeleteResult = new ConceptEventDeleteResult
            {
                ConceptSqlSetDependents = new ConceptSqlSetDependent[] {}
            };

            Assert.True(conceptEventDeleteResult.Ok);
        }

        [Fact]
        public void Ok_Is_False_When_There_Are_ConceptSqlSetDependents()
        {
            var conceptEventDeleteResult = new ConceptEventDeleteResult
            {
                ConceptSqlSetDependents = new ConceptSqlSetDependent[]
                {
                    new ConceptSqlSetDependent
                    {
                        Id = 1,
                        SqlSetFrom = "SqlSetFrom-test-string"
                    }
                }
            };

            Assert.False(conceptEventDeleteResult.Ok);
        }
    }
}
