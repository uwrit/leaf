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
    public class PreflightResourcesTests
    {
        [Theory]
        [ClassData(typeof(PROkTestData))]
        public void Ok_Theory(PreflightResources resources, bool expected)
        {
            var ok = resources.Ok;
            Assert.Equal(expected, ok);
        }

        [Fact]
        public void Concepts_Should_Match_Count_If_Ok()
        {
            var first = new QueryRef { Id = Guid.NewGuid(), UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var second = new QueryRef { Id = Guid.NewGuid(), UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };
            var errorUid = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42");

            var c12342 = Guid.NewGuid();
            var c12345 = Guid.NewGuid();
            var c12341 = Guid.NewGuid();
            var c12344 = Guid.NewGuid();
            var c12340 = Guid.NewGuid();
            var c12350 = Guid.NewGuid();

            var pr = new PreflightResources(new QueryRef[] { first, second })
            {
                DirectConceptsCheck = new PreflightConcepts
                {
                    PreflightCheck = new ConceptPreflightCheck
                    {
                        Results = new ConceptPreflightCheckResult[]
                        {
                            new ConceptPreflightCheckResult
                            {
                                Id = c12342,
                                UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42"),
                                IsPresent = true,
                                IsAuthorized = true
                            },
                            new ConceptPreflightCheckResult
                            {
                                Id = c12345,
                                UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.45"),
                                IsPresent = true,
                                IsAuthorized = true
                            }
                        }
                    },
                    Concepts = new Concept[]
                    {
                        new Concept
                        {
                            Id = c12342,
                            UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42"),
                        },
                        new Concept
                        {
                            Id = c12345,
                            UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.45"),
                        }
                    }
                },
                DirectQueriesCheck = new PreflightQueries
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
                                        Id = c12341,
                                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.41"),
                                        IsPresent = true,
                                        IsAuthorized = true
                                    },
                                    new ConceptPreflightCheckResult
                                    {
                                        Id = c12344,
                                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.44"),
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
                                        Id = c12340,
                                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.40"),
                                        IsPresent = true,
                                        IsAuthorized = true
                                    },
                                    new ConceptPreflightCheckResult
                                    {
                                        Id = c12350,
                                        UniversalId = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.50"),
                                        IsPresent = true,
                                        IsAuthorized = true
                                    }
                                }
                            }
                        }
                    }
                }
            };

            var concepts = pr.Concepts(new Model.Options.CompilerOptions { Alias = "@", FieldPersonId = "person_id" });

            Assert.True(concepts.Count() == 4);
            Assert.Contains(concepts, c => c.Id == c12342);
            Assert.Contains(concepts, c => c.Id == c12345);
            Assert.Contains(concepts, c => c.Id == first.Id.Value);
            Assert.Contains(concepts, c => c.Id == second.Id.Value);
        }

        [Fact]
        public void Errors_Should_Be_Default_If_Ok()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var second = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };
            var errorUid = ConceptUrn.From("urn:leaf:concept:diag:codeset=ICD9+code=123.42");
            var pr = new PreflightResources(new QueryRef[] { })
            {
                DirectConceptsCheck = new PreflightConcepts
                {
                    PreflightCheck = new ConceptPreflightCheck
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
                DirectQueriesCheck = new PreflightQueries
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
                }
            };

            var errors = pr.Errors();
            Assert.False(errors.ConceptErrors.Any() && errors.QueryErrors.Any());
        }

        [Fact]
        public void Errors_Concepts_Should_Have_Data_If_Not_Ok()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var second = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };
            var pr = new PreflightResources(new QueryRef[] { })
            {
                DirectConceptsCheck = new PreflightConcepts
                {
                    PreflightCheck = new ConceptPreflightCheck
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
                DirectQueriesCheck = new PreflightQueries
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
                }
            };

            var errors = pr.Errors();
            Assert.True(errors.ConceptErrors.Count() == 1);
            Assert.False(errors.QueryErrors.Any());
        }

        [Fact]
        public void Errors_Queries_Should_Have_Data_If_Not_Ok()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var second = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };
            var pr = new PreflightResources(new QueryRef[] { })
            {
                DirectConceptsCheck = new PreflightConcepts
                {
                    PreflightCheck = new ConceptPreflightCheck
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
                DirectQueriesCheck = new PreflightQueries
                {
                    Results = new QueryPreflightCheckResult[]
                    {
                        new QueryPreflightCheckResult
                        {
                            QueryRef = first,
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
                }
            };

            var errors = pr.Errors();

            Assert.False(errors.ConceptErrors.Any());
            Assert.True(errors.QueryErrors.Any());
        }
    }

    class PROkTestData : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            var first = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") };
            var second = new QueryRef { UniversalId = QueryUrn.From("urn:leaf:query:d7359668-df0d-4604-a2d9-1d3d04417dc2:563423") };

            yield return new object[]
            {
                new PreflightResources(new QueryRef[] { })
                {
                    DirectConceptsCheck = new PreflightConcepts
                    {
                        PreflightCheck = new ConceptPreflightCheck
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
                    DirectQueriesCheck = new PreflightQueries
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
                    }
                },
                true
            };
            yield return new object[]
            {
                new PreflightResources(new QueryRef[] { })
                {
                    DirectConceptsCheck = new PreflightConcepts
                    {
                        PreflightCheck = new ConceptPreflightCheck
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
                    DirectQueriesCheck = new PreflightQueries
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
                    }
                },
                false
            };
            yield return new object[]
            {
                new PreflightResources(new QueryRef[] { })
                {
                    DirectConceptsCheck = new PreflightConcepts
                    {
                        PreflightCheck = new ConceptPreflightCheck
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
                    DirectQueriesCheck = new PreflightQueries
                    {
                        Results = new QueryPreflightCheckResult[]
                        {
                            new QueryPreflightCheckResult
                            {
                                QueryRef = first,
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
                    }
                },
                false
            };
            yield return new object[]
            {
                new PreflightResources(new QueryRef[] { })
                {
                    DirectConceptsCheck = new PreflightConcepts
                    {
                        PreflightCheck = new ConceptPreflightCheck
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
                    DirectQueriesCheck = new PreflightQueries
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
                                            IsPresent = false,
                                            IsAuthorized = false
                                        }
                                    }
                                }
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
