// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Tests.Mock.Models.Collections;
using Tests.Mock.Models;
using Xunit;

namespace Tests
{
    public class ConcurrentQueueSetTests
    {
        [Fact]
        public void Fresh_Queue_Is_Empty()
        {
            var q = new EndpointConcurrentQueueSet();
            Assert.True(q.IsEmpty);
        }

        [Fact]
        public void Enqueueing_Sets_Is_Not_Empty()
        {
            var q = new EndpointConcurrentQueueSet();
            var endpoint = new Endpoint { Issuer = "issuer1" };

            var ok = q.TryEnqueue(endpoint);

            Assert.True(ok);
            Assert.False(q.IsEmpty);
        }

        [Fact]
        public void Enqueueing_Twice_Fails_On_Second_Add()
        {
            var q = new EndpointConcurrentQueueSet();
            var endpoint = new Endpoint { Issuer = "issuer1" };

            var first = q.TryEnqueue(endpoint);
            var second = q.TryEnqueue(endpoint);

            Assert.True(first);
            Assert.False(second);
        }

        [Fact]
        public void Enqueue_Dequeue_Enqueue_Succeeds()
        {
            var q = new EndpointConcurrentQueueSet();
            var endpoint = new Endpoint { Issuer = "issuer1" };

            q.TryEnqueue(endpoint);
            q.TryDequeue(out var _);
            var ok = q.TryEnqueue(endpoint);

            Assert.True(ok);
        }

        [Fact]
        public void Drain_Length_Equals_Unique_Additions()
        {
            var q = new EndpointConcurrentQueueSet();
            var e1 = new Endpoint { Issuer = "issuer1" };
            var e2 = new Endpoint { Issuer = "issuer2" };

            q.TryEnqueue(e1);
            q.TryEnqueue(e2);
            q.TryEnqueue(e2);

            var uniq = q.Drain();

            Assert.Equal(2, uniq.Count());
        }
    }
}
