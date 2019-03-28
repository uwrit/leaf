// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using Model.Compiler;
using Model.Tagging;
using System.Collections.Generic;
using System.Linq;
using System.Collections;

namespace Tests
{
    public class ConceptPreflightCheckTests
    {
        [Theory]
        [ClassData(typeof(CPCTestData))]
        public void Ok_Theory(ConceptPreflightCheck cpc, bool expected)
        {
            Assert.Equal(expected, cpc.Ok);
        }

        [Fact]
        public void Errors_Empty_If_Ok()
        {
            var cpc = new ConceptPreflightCheck
            {
                Results = new ConceptPreflightCheckResult[]
                {
                    new ConceptPreflightCheckResult
                    {
                        Id = Guid.NewGuid(),
                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42"),
                        IsPresent = true,
                        IsAuthorized = true
                    },
                    new ConceptPreflightCheckResult
                    {
                        Id = Guid.NewGuid(),
                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.45"),
                        IsPresent = true,
                        IsAuthorized = true
                    }
                }
            };

            var errors = cpc.Errors();

            Assert.False(errors.Any());
        }

        [Fact]
        public void Errors_Match_If_Not_Ok()
        {
            var errorUid = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42");
            var cpc = new ConceptPreflightCheck
            {
                Results = new ConceptPreflightCheckResult[]
                {
                    new ConceptPreflightCheckResult
                    {
                        Id = Guid.NewGuid(),
                        UniversalId = errorUid,
                        IsPresent = false,
                        IsAuthorized = false
                    },
                    new ConceptPreflightCheckResult
                    {
                        Id = Guid.NewGuid(),
                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.45"),
                        IsPresent = true,
                        IsAuthorized = true
                    }
                }
            };

            var errors = cpc.Errors();

            Assert.True(errors.Count() == 1);
            Assert.Equal(errorUid, errors.First().UniversalId, new UrnEqualityComparer());
        }
    }

    class CPCTestData : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            yield return new object[]
            {
                new ConceptPreflightCheck
                {
                    Results = new ConceptPreflightCheckResult[]
                    {
                        new ConceptPreflightCheckResult
                        {
                            Id = Guid.NewGuid(),
                            UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42"),
                            IsPresent = true,
                            IsAuthorized = true
                        },
                        new ConceptPreflightCheckResult
                        {
                            Id = Guid.NewGuid(),
                            UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.45"),
                            IsPresent = true,
                            IsAuthorized = true
                        }
                    }
                },
                true
            };
            yield return new object[]
            {
                new ConceptPreflightCheck
                {
                    Results = new ConceptPreflightCheckResult[]
                    {
                        new ConceptPreflightCheckResult
                        {
                            Id = Guid.NewGuid(),
                            UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42"),
                            IsPresent = false,
                            IsAuthorized = false
                        },
                        new ConceptPreflightCheckResult
                        {
                            Id = Guid.NewGuid(),
                            UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.45"),
                            IsPresent = true,
                            IsAuthorized = true
                        }
                    }
                },
                false
            };
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
