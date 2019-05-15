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
    public class AdminNetworkEndpointManager : NetworkEndpointProvider
    {
        public AdminNetworkEndpointManager(
            INetworkEndpointService service,
            NetworkValidator validator,
            ILogger<AdminNetworkEndpointManager> log) : base(service, validator, log)
        {
        }

        public override async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            return await service.GetEndpointsAsync();
        }

        public override async Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            return await service.GetEndpointsWithIdentityAsync();
        }

        public override async Task<NetworkIdentity> GetIdentityAsync()
        {
            return await service.GetIdentityAsync();
        }

        public override async Task<IEnumerable<NetworkEndpoint>> GetRespondersAsync()
        {
            return await GetEndpointsAsync(e => e.IsResponder);
        }

        public override async Task<NetworkIdentityEndpoints> GetRespondersWithIdentityAsync()
        {
            return await GetIdentityEndpointsAsync(e => e.IsResponder);
        }

        public override async Task<IEnumerable<NetworkEndpoint>> GetInterrogatorsAsync()
        {
            return await GetEndpointsAsync(e => e.IsInterrogator);
        }

        public override async Task<NetworkIdentityEndpoints> GetInterrogatorsWithIdentityAsync()
        {
            return await GetIdentityEndpointsAsync(e => e.IsInterrogator);
        }

        async Task<NetworkIdentityEndpoints> GetIdentityEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var nie = await service.GetEndpointsWithIdentityAsync();
            nie.Endpoints = nie.Endpoints.Where(predicate);
            return nie;
        }

        async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var endpoints = await service.GetEndpointsAsync();
            return endpoints.Where(predicate);
        }

        public async Task<UpdateResult<NetworkEndpoint>> UpdateEndpointAsync(NetworkEndpoint item)
        {
            validator.Validate(item);
            var result = await service.UpdateAsync(item);
            log.LogInformation("Updated NetworkEndpoint. Result:{@Result}", result);
            return result;
        }
    }
}
