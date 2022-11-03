// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
    class QRECTestData : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            yield return new object[]
            {
                new QueryRef(QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456")),
                new QueryRef(QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456")),
                true
            };
            yield return new object[]
            {
                new QueryRef{ Id = Guid.NewGuid(), UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") },
                new QueryRef{ Id = Guid.NewGuid(), UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") },
                true
            };
            yield return new object[]
            {
                new QueryRef{ Id = Guid.NewGuid(), UniversalId = QueryUrn.From("urn:leaf:query:d7359679-df0d-4604-a2d9-1d3d04417dc2:123456") },
                new QueryRef{ Id = Guid.NewGuid(), UniversalId = QueryUrn.From("urn:leaf:query:d7359678-df0d-4604-a2d9-1d3d04417dc2:123456") },
                false
            };
            var id = Guid.NewGuid();
            yield return new object[]
            {
                new QueryRef{ Id = id },
                new QueryRef{ Id = id },
                true
            };
            yield return new object[]
            {
                new QueryRef{ Id = Guid.NewGuid() },
                new QueryRef{ Id = Guid.NewGuid() },
                false
            };
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    public class QueryRefTests
    {
        [Theory]
        [ClassData(typeof(QRECTestData))]
        public void QueryRefEqualityComparer_Theory(QueryRef x, QueryRef y, bool expected)
        {
            var equal = new QueryRefEqualityComparer();

            Assert.Equal(expected, equal.Equals(x, y));
        }
    }
}
