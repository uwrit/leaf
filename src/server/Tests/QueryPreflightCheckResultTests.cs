// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
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
    public class QueryPreflightCheckResultTests
    {
        [Theory]
        [ClassData(typeof(QPCROkTestData))]
        public void Ok_Theory(QueryPreflightCheckResult result, bool expected)
        {
            var ok = result.Ok;
            Assert.Equal(expected, ok);
        }

        [Fact]
        public void Errors_Should_Return_Null_If_Ok()
        {
            var qpcr = new QueryPreflightCheckResult
            {
                QueryRef = new QueryRef(QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456")),
                IsPresent = true,
                IsAuthorized = true,
                ConceptCheck = new ConceptPreflightCheck
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
                }
            };

            Assert.Null(qpcr.Errors());
        }
    }

    class QPCROkTestData : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            yield return new object[]
            {
                new QueryPreflightCheckResult
                {
                    QueryRef = new QueryRef(QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456")),
                    IsPresent = true,
                    IsAuthorized = true,
                    ConceptCheck = new ConceptPreflightCheck
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
                    }

                },
                true
            };
            yield return new object[]
            {
                new QueryPreflightCheckResult
                {
                    QueryRef = new QueryRef(QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456")),
                    IsPresent = false,
                    IsAuthorized = false,
                    ConceptCheck = new ConceptPreflightCheck
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
                    }

                },
                false
            };
            yield return new object[]
            {
                new QueryPreflightCheckResult
                {
                    QueryRef = new QueryRef(QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456")),
                    IsPresent = true,
                    IsAuthorized = true,
                    ConceptCheck = new ConceptPreflightCheck
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
