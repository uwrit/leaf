// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Linq;
using Model.Results;

namespace Model.Network
{
    // TODO(cspital) migrate update to future admin service
    public interface INetworkEndpointService
    {
        Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync();
        Task<UpdateResult<NetworkEndpoint>> UpdateAsync(NetworkEndpoint endpoint);
        Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync();
        Task<NetworkIdentity> GetIdentityAsync();
    }

    public class NetworkEndpointProvider
    {
        protected readonly INetworkEndpointService service;
        protected readonly NetworkValidator validator;
        protected readonly ILogger<NetworkEndpointProvider> log;

        public NetworkEndpointProvider(
            INetworkEndpointService service,
            NetworkValidator validator,
            ILogger<NetworkEndpointProvider> log)
        {
            this.service = service;
            this.validator = validator;
            this.log = log;
        }

        public virtual async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            var eps = await service.GetEndpointsAsync();
            return ValidateEndpoints(eps);
        }

        public virtual async Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            var nie = await service.GetEndpointsWithIdentityAsync();
            nie.Endpoints = ValidateEndpoints(nie.Endpoints);
            return nie;
        }

        public virtual async Task<NetworkIdentity> GetIdentityAsync()
        {
            return await service.GetIdentityAsync();
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
            return await GetValidIdentityEndpointsAsync(e => e.IsResponder);
        }


        async Task<NetworkIdentityEndpoints> GetValidIdentityEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var nie = await service.GetEndpointsWithIdentityAsync();
            nie.Endpoints = ValidateEndpoints(nie.Endpoints.Where(predicate));
            return nie;
        }

        async Task<IEnumerable<NetworkEndpoint>> GetValidEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var endpoints = await service.GetEndpointsAsync();
            return ValidateEndpoints(endpoints.Where(predicate));
        }

        IEnumerable<NetworkEndpoint> ValidateEndpoints(IEnumerable<NetworkEndpoint> endpoints)
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
