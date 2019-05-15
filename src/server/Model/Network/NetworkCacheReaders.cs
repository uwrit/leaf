// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Network
{
    public interface INetworkResponderCacheReader
    {
        IEnumerable<NetworkEndpoint> Responders();
        NetworkEndpoint GetResponderOrDefault(string issuer);
    }

    public class NetworkResponderCacheReader : INetworkResponderCacheReader
    {
        readonly INetworkEndpointCache cache;

        public NetworkResponderCacheReader(INetworkEndpointCache cache)
        {
            this.cache = cache;
        }

        public IEnumerable<NetworkEndpoint> Responders()
        {
            return cache.Where(e => e.IsResponder);
        }

        public NetworkEndpoint GetResponderOrDefault(string issuer)
        {
            var endpoint = cache.GetOrDefault(issuer);
            if (endpoint.IsResponder)
            {
                return endpoint;
            }
            return null;
        }
    }

    public interface INetworkInterrogatorCacheReader
    {
        IEnumerable<NetworkEndpoint> Interrogators();
        NetworkEndpoint GetInterrogatorOrDefault(string issuer);
    }

    public class NetworkInterrogatorCacheReader : INetworkInterrogatorCacheReader
    {
        readonly INetworkEndpointCache cache;

        public NetworkInterrogatorCacheReader(INetworkEndpointCache cache)
        {
            this.cache = cache;
        }

        public IEnumerable<NetworkEndpoint> Interrogators()
        {
            return cache.Where(e => e.IsInterrogator);
        }

        public NetworkEndpoint GetInterrogatorOrDefault(string issuer)
        {
            var endpoint = cache.GetOrDefault(issuer);
            if (endpoint.IsInterrogator)
            {
                return endpoint;
            }
            return null;
        }
    }
}
