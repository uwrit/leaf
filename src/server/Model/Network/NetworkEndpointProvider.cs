// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Model.Network
{
    public class NetworkEndpointProvider
    {
        public interface INetworkEndpointReader
        {
            Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync();
            Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync();
            Task<NetworkIdentity> GetIdentityAsync();
        }

        protected readonly INetworkEndpointReader reader;
        protected readonly NetworkValidator validator;
        protected readonly ILogger<NetworkEndpointProvider> log;

        public NetworkEndpointProvider(
            INetworkEndpointReader reader,
            NetworkValidator validator,
            ILogger<NetworkEndpointProvider> log)
        {
            this.reader = reader;
            this.validator = validator;
            this.log = log;
        }

        public virtual async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            var eps = await reader.GetEndpointsAsync();
            return FilterInvalidEndpoints(eps.Where(e => e.IsResponder || e.IsInterrogator));
        }

        public virtual async Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            var nie = await reader.GetEndpointsWithIdentityAsync();
            nie.Endpoints = FilterInvalidEndpoints(nie.Endpoints.Where(e => e.IsResponder || e.IsInterrogator));
            return nie;
        }

        public virtual async Task<NetworkIdentity> GetIdentityAsync()
        {
            return await reader.GetIdentityAsync();
        }

        public virtual async Task<IEnumerable<NetworkEndpoint>> GetRespondersAsync()
        {
            return await GetValidEndpointsAsync(e => e.IsResponder);
        }

        public virtual async Task<NetworkIdentityEndpoints> GetRespondersWithIdentityAsync()
        {
            return await GetValidIdentityEndpointsAsync(e => e.IsResponder);
        }

        public virtual async Task<IEnumerable<NetworkEndpoint>> GetInterrogatorsAsync()
        {
            return await GetValidEndpointsAsync(e => e.IsInterrogator);
        }

        public virtual async Task<NetworkIdentityEndpoints> GetInterrogatorsWithIdentityAsync()
        {
            return await GetValidIdentityEndpointsAsync(e => e.IsInterrogator);
        }


        async Task<NetworkIdentityEndpoints> GetValidIdentityEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var nie = await reader.GetEndpointsWithIdentityAsync();
            nie.Endpoints = FilterInvalidEndpoints(nie.Endpoints.Where(predicate));
            return nie;
        }

        async Task<IEnumerable<NetworkEndpoint>> GetValidEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var endpoints = await reader.GetEndpointsAsync();
            return FilterInvalidEndpoints(endpoints.Where(predicate));
        }

        IEnumerable<NetworkEndpoint> FilterInvalidEndpoints(IEnumerable<NetworkEndpoint> endpoints)
        {
            var ok = new List<NetworkEndpoint>();
            foreach (var ep in endpoints)
            {
                try
                {
                    validator.Validate(ep);
                    ok.Add(ep);
                }
                catch (UriFormatException ue)
                {
                    log.LogError("NetworkEndpoint is invalid. Endpoint:{@Endpoint} Error:{Error}", ep, ue.Message);
                }
            }
            return ok;
        }
    }
}
