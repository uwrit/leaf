// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using Xunit;

namespace Tests
{
    public class UrnTests
    {
        [Fact]
        public void ConceptUrn_From_Concept_Urn_Ok()
        {
            var urn = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            var curn = ConceptUrn.From(urn);

            Assert.Equal(urn, curn.ToString());
        }

        [Fact]
        public void QueryUrn_From_Query_Urn_Ok()
        {
            var urn = $"urn:leaf:query:{Guid.NewGuid()}:12318742";

            var curn = QueryUrn.From(urn);

            Assert.Equal(urn, curn.ToString());
        }

        [Fact]
        public void DatasetQueryUrn_From_DatasetQuery_Urn_Ok()
        {
            var urn = "urn:leaf:dataset:diabetes-a1c-agar-10x";

            var curn = DatasetQueryUrn.From(urn);

            Assert.Equal(urn, curn.ToString());
        }

        [Fact]
        public void ConceptUrn_From_Null_Null()
        {
            Assert.Null(ConceptUrn.From(null));
        }

        [Fact]
        public void QueryUrn_From_Null_Null()
        {
            Assert.Null(QueryUrn.From(null));
        }

        [Fact]
        public void DatasetQueryUrn_From_Null_Null()
        {
            Assert.Null(DatasetQueryUrn.From(null));
        }

        [Fact]
        public void ConceptUrn_From_EmptyWS_Null()
        {
            Assert.Null(ConceptUrn.From(""));
        }

        [Fact]
        public void QueryUrn_From_EmptyWS_Null()
        {
            Assert.Null(QueryUrn.From(" "));
        }

        [Fact]
        public void DatasetQueryUrn_From_EmptyWS_Null()
        {
            Assert.Null(DatasetQueryUrn.From("  "));
        }

        [Fact]
        public void ConceptUrn_From_NonConcept_Urn_Should_Fail()
        {
            var urn = $"urn:leaf:query:{Guid.NewGuid()}:12318742";

            Assert.Throws<FormatException>(() => ConceptUrn.From(urn));
        }

        [Fact]
        public void QueryUrn_From_NonQueryUrn_Should_Fail()
        {
            var urn = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            Assert.Throws<FormatException>(() => QueryUrn.From(urn));
        }

        [Fact]
        public void DatasetQueryUrn_From_NonDatasetQueryUrn_Should_Fail()
        {
            var urn = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            Assert.Throws<FormatException>(() => DatasetQueryUrn.From(urn));
        }

        [Fact]
        public void ConceptUrn_TryParse_From_Concept_Urn_Ok()
        {
            var urn = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            var ok = ConceptUrn.TryParse(urn, out var _);

            Assert.True(ok);
        }

        [Fact]
        public void QueryUrn_TryParse_From_Query_Urn_Ok()
        {
            var urn = $"urn:leaf:query:{Guid.NewGuid()}:12318742";

            var ok = QueryUrn.TryParse(urn, out var _);

            Assert.True(ok);
        }

        [Fact]
        public void DatasetQueryUrn_TryParse_From_DatasetQuery_Urn_Ok()
        {
            var urn = "urn:leaf:dataset:diabetes-a1c-agar-10x";

            var ok = DatasetQueryUrn.TryParse(urn, out var _);

            Assert.True(ok);
        }

        [Fact]
        public void ConceptUrn_TryParse_Null_False()
        {
            Assert.False(ConceptUrn.TryParse(null, out var _));
        }

        [Fact]
        public void QueryUrn_TryParse_Null_False()
        {
            Assert.False(QueryUrn.TryParse(null, out var _));
        }

        [Fact]
        public void DatasetQueryUrn_TryParse_Null_False()
        {
            Assert.False(DatasetQueryUrn.TryParse(null, out var _));
        }

        [Fact]
        public void ConceptUrn_TryParse_EmptyWS_False()
        {
            Assert.False(ConceptUrn.TryParse("", out var _));
        }

        [Fact]
        public void QueryUrn_TryParse_EmptyWS_False()
        {
            Assert.False(QueryUrn.TryParse(" ", out var _));
        }

        [Fact]
        public void DatasetQueryUrn_TryParse_EmptyWS_False()
        {
            Assert.False(DatasetQueryUrn.TryParse("  ", out var _));
        }

        [Fact]
        public void ConceptUrn_TryParse_NonConceptUrn_False()
        {
            var urn = $"urn:leaf:query:{Guid.NewGuid()}:12318742";

            Assert.False(ConceptUrn.TryParse(urn, out var _));
        }

        [Fact]
        public void QueryUrn_TryParse_NonQueryUrn_False()
        {
            var urn = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            Assert.False(QueryUrn.TryParse(urn, out var _));
        }

        [Fact]
        public void DatasetQueryUrn_TryParse_NonDatasetQueryUrn_False()
        {
            var urn = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            Assert.False(DatasetQueryUrn.TryParse(urn, out var _));
        }

        [Fact]
        public void QueryUrn_Create_Ok()
        {
            var id = Guid.NewGuid();

            var urn = QueryUrn.Create(id);

            Assert.Contains(id.ToString(), urn.ToString());
        }

        [Fact]
        public void Urn_TryParseUrn_ConceptUrn_Ok()
        {
            var val = "urn:leaf:concept:diag:codeset=ICD9+code=123.42";

            var ok = Urn.TryParse(val, out var urn);

            Assert.True(ok);
            Assert.IsType<ConceptUrn>(urn);
        }

        [Fact]
        public void Urn_TryParseUrn_ResourceMissing_Err()
        {
            var val = "urn:leaf:test:other_stuff";

            var ok = Urn.TryParse(val, out var urn);

            Assert.False(ok);
        }

        [Fact]
        public void Urn_TryParseUrn_Malformed_Err()
        {
            var val = "urn:leaf:";

            var ok = Urn.TryParse(val, out var urn);

            Assert.False(ok);
        }

        [Fact]
        public void Urn_TryParseUrn_QueryUrn_Ok()
        {
            var val = $"urn:leaf:query:{Guid.NewGuid()}:12318742";

            var ok = Urn.TryParse(val, out var urn);

            Assert.True(ok);
            Assert.IsType<QueryUrn>(urn);
        }
    }
}
