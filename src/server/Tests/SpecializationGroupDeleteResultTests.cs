// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Admin.Compiler;
using Xunit;
namespace Tests
{
    public class SpecializationGroupDeleteResultTests
    { 
        [Fact]
        public void Ok_Is_True_When_There_Are_No_ConceptDependents()
        {
            var specializationGroupDeleteResult = new SpecializationGroupDeleteResult
            {
                ConceptDependents = new ConceptDependent[] {}
            };

            Assert.True(specializationGroupDeleteResult.Ok);
        }

        [Fact]
        public void Ok_Is_False_When_There_Are_ConceptDependents()
        {
            var specializationGroupDeleteResult = new SpecializationGroupDeleteResult
            {
                ConceptDependents = new ConceptDependent[]
                {
                    new ConceptDependent
                    {
                        Id = Guid.NewGuid(),
                        UniversalId = "UniversalId-test-string",
                        UiDisplayName = "UiDisplayName-test-string"
                    }
                }
            };

            Assert.False(specializationGroupDeleteResult.Ok);
        }
    }
}
