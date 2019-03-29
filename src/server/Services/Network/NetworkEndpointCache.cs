// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Network;
using Model.Collections;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;

namespace Services.Network
{
    using Issuer = String;

    public class NetworkEndpointCache
    {
        Dictionary<Issuer, NetworkEndpoint> store;
        readonly ReaderWriterLockSlim sync;

        public NetworkEndpointCache(IEnumerable<NetworkEndpoint> initial)
        {
            store = initial.ToDictionary(ne => ne.Issuer);
            sync = new ReaderWriterLockSlim();
        }

        public IEnumerable<NetworkEndpoint> All()
        {
            sync.EnterReadLock();
            var all = store.Values;
            sync.ExitReadLock();
            return all;
        }

        public NetworkEndpoint Get(Issuer issuer)
        {
            sync.EnterReadLock();
            store.TryGetValue(issuer, out var endpoint);
            sync.ExitReadLock();
            return endpoint;
        }

        public void Put(NetworkEndpoint endpoint)
        {
            sync.EnterWriteLock();
            store[endpoint.Issuer] = endpoint;
            sync.ExitWriteLock();
        }

        public void Put(IEnumerable<NetworkEndpoint> endpoints)
        {
            sync.EnterWriteLock();
            foreach (var endpoint in endpoints)
            {
                store[endpoint.Issuer] = endpoint;
            }
            sync.ExitWriteLock();
        }

        public void Overwrite(IEnumerable<NetworkEndpoint> endpoints)
        {
            sync.EnterWriteLock();
            store = endpoints.ToDictionary(ne => ne.Issuer);
            sync.ExitWriteLock();
        }

        public NetworkEndpoint Pop(Issuer issuer)
        {
            sync.EnterWriteLock();
            store.Remove(issuer, out var endpoint);
            sync.ExitWriteLock();
            return endpoint;
        }
    }
}
