// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using Xunit;
using Model.Options;
using Model.Network;

namespace Tests
{
    public class NetworkEndpointCacheTests
    {
        static NetworkEndpointCache Cache()
        {
            return new NetworkEndpointCache(new NetworkEndpoint[]
            {
                new NetworkEndpoint { Id = 1, Issuer = "leaf.entity1.tld" },
                new NetworkEndpoint { Id = 2, Issuer = "leaf.entity2.tld" }
            });
        }
        [Fact]
        public void All_Should_Return_Initial_Ok()
        {
            var cache = Cache();

            var all = cache.All();

            Assert.True(all.Count() == 2);
            Assert.Contains(all, e => e.Id == 1);
            Assert.Contains(all, e => e.Id == 2);
        }

        [Fact]
        public void Get_Should_Return_Correct_Ok()
        {
            var cache = Cache();

            var one = cache.Get("leaf.entity1.tld");

            Assert.NotNull(one);
        }

        [Fact]
        public void Overwrite_Should_Fully_Replace_Store()
        {
            var cache = Cache();

            cache.Overwrite(new NetworkEndpoint[]
            {
                new NetworkEndpoint { Id = 3, Issuer = "leaf.entity3.tld" },
                new NetworkEndpoint { Id = 4, Issuer = "leaf.entity4.tld" },
                new NetworkEndpoint { Id = 5, Issuer = "leaf.entity5.tld" }
            });

            var all = cache.All();
            Assert.True(all.Count() == 3);
            Assert.Null(cache.Get("leaf.entity1.tld"));
        }

        [Fact]
        public void Pop_Should_Return_And_Remove()
        {
            var cache = Cache();

            var one = cache.Pop("leaf.entity1.tld");

            Assert.NotNull(one);
            Assert.Null(cache.Get("leaf.entity1.tld"));
        }

        [Fact]
        public void Put_Should_Update_Endpoint_If_Exists()
        {
            var cache = Cache();

            cache.Put(new NetworkEndpoint { Id = 1, Issuer = "leaf.entity1.tld", Name = "Hello" });

            var hello = cache.Get("leaf.entity1.tld");

            Assert.NotNull(hello);
            Assert.Equal("Hello", hello.Name);
            Assert.True(cache.All().Count() == 2);
        }

        [Fact]
        public void Put_Should_Add_Endpoint_If_Not_Exists()
        {
            var cache = Cache();

            cache.Put(new NetworkEndpoint { Id = 3, Issuer = "leaf.entity3.tld" });

            Assert.True(cache.All().Count() == 3);
        }
    }
}
