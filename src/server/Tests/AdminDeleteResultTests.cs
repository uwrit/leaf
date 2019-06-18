// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using Model.Admin.Compiler;
using Model.Tagging;
using System.Collections.Generic;
using System.Linq;
using System.Collections;

namespace Tests
{
    public class AdminDeleteResultTests
    {
        [Fact]
        public void ConceptSqlSetDeleteResult_Should_Ok_If_No_Dependents()
        {
            var result = new ConceptSqlSetDeleteResult();

            Assert.True(result.Ok);
        }

        [Fact]
        public void ConceptSqlSetDeleteResult_Should_Not_Ok_If_Dependents()
        {
            var result = new ConceptSqlSetDeleteResult
            {
                ConceptDependents = new List<ConceptDependent>
                {
                    new ConceptDependent()
                }
            };

            Assert.False(result.Ok);
        }
    }
}
