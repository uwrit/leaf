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

namespace Tests
{
    public class PreflightQueriesTests
    {
        [Fact]
        public void DirectQueries_Should_Return_SubSet()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var omit = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };

            var direct = new QueryRef[] { first };

            var qpc = new PreflightQueries
            {
                Results = new QueryPreflightCheckResult[]
                {
                    new QueryPreflightCheckResult
                    {
                        QueryRef = first,
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
                    new QueryPreflightCheckResult
                    {
                        QueryRef = omit,
                        IsPresent = true,
                        IsAuthorized = true,
                        ConceptCheck = new ConceptPreflightCheck
                        {
                            Results = new ConceptPreflightCheckResult[]
                            {
                                new ConceptPreflightCheckResult
                                {
                                    Id = Guid.NewGuid(),
                                    UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.41"),
                                    IsPresent = true,
                                    IsAuthorized = true
                                },
                                new ConceptPreflightCheckResult
                                {
                                    Id = Guid.NewGuid(),
                                    UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.50"),
                                    IsPresent = true,
                                    IsAuthorized = true
                                }
                            }
                        }
                    }
                }
            };
            var results = qpc.DirectQueries(direct);

            Assert.True(results.Count() == 1);
            Assert.Equal(direct, results, new QueryRefEqualityComparer());
        }

        [Fact]
        public void DirectQueries_Should_Return_MatchingSet()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var second = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };

            var direct = new QueryRef[] { first, second };

            var qpc = new PreflightQueries
            {
                Results = new QueryPreflightCheckResult[]
                {
                    new QueryPreflightCheckResult
                    {
                        QueryRef = first,
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
                    new QueryPreflightCheckResult
                    {
                        QueryRef = second,
                        IsPresent = true,
                        IsAuthorized = true,
                        ConceptCheck = new ConceptPreflightCheck
                        {
                            Results = new ConceptPreflightCheckResult[]
                            {
                                new ConceptPreflightCheckResult
                                {
                                    Id = Guid.NewGuid(),
                                    UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.41"),
                                    IsPresent = true,
                                    IsAuthorized = true
                                },
                                new ConceptPreflightCheckResult
                                {
                                    Id = Guid.NewGuid(),
                                    UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.50"),
                                    IsPresent = true,
                                    IsAuthorized = true
                                }
                            }
                        }
                    }
                }
            };
            var results = qpc.DirectQueries(direct);

            Assert.True(results.Count() == 2);
            Assert.Equal(direct, results, new QueryRefEqualityComparer());
        }

        [Fact]
        public void DirectQueries_Should_Return_EmptySet()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var omit = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };

            var direct = new QueryRef[] { };

            var qpc = new PreflightQueries
            {
                Results = new QueryPreflightCheckResult[]
                {
                    new QueryPreflightCheckResult
                    {
                        QueryRef = first,
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
                    new QueryPreflightCheckResult
                    {
                        QueryRef = omit,
                        IsPresent = true,
                        IsAuthorized = true,
                        ConceptCheck = new ConceptPreflightCheck
                        {
                            Results = new ConceptPreflightCheckResult[]
                            {
                                new ConceptPreflightCheckResult
                                {
                                    Id = Guid.NewGuid(),
                                    UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.41"),
                                    IsPresent = true,
                                    IsAuthorized = true
                                },
                                new ConceptPreflightCheckResult
                                {
                                    Id = Guid.NewGuid(),
                                    UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.50"),
                                    IsPresent = true,
                                    IsAuthorized = true
                                }
                            }
                        }
                    }
                }
            };
            var results = qpc.DirectQueries(direct);

            Assert.False(results.Any());
            Assert.Equal(direct, results, new QueryRefEqualityComparer());
        }
    }
}
