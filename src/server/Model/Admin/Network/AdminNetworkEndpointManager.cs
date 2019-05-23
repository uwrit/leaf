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
using Model.Network;
using Model.Validation;
using Model.Error;
using System.Data.Common;

namespace Model.Admin.Network
{
    public class AdminNetworkEndpointManager : NetworkEndpointProvider
    {
        public interface IAdminNetworkUpdater
        {
            Task<NetworkEndpoint> CreateEndpointAsync(NetworkEndpoint endpoint);
            Task<NetworkEndpoint> DeleteEndpointAsync(int id);
            Task<UpdateResult<NetworkEndpoint>> UpdateEndpointAsync(NetworkEndpoint endpoint);
            Task<UpdateResult<NetworkIdentity>> UpdateIdentityAsync(NetworkIdentity identity);
        }

        readonly IAdminNetworkUpdater updater;
        readonly INetworkEndpointCache cache;

        public AdminNetworkEndpointManager(
            INetworkEndpointReader reader,
            IAdminNetworkUpdater updater,
            INetworkEndpointCache cache,
            NetworkValidator validator,
            ILogger<AdminNetworkEndpointManager> log) : base(reader, validator, log)
        {
            this.updater = updater;
            this.cache = cache;
        }

        public override async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            return await reader.GetEndpointsAsync();
        }

        public override async Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            return await reader.GetEndpointsWithIdentityAsync();
        }

        public override async Task<NetworkIdentity> GetIdentityAsync()
        {
            return await reader.GetIdentityAsync();
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
            var nie = await reader.GetEndpointsWithIdentityAsync();
            nie.Endpoints = nie.Endpoints.Where(predicate);
            return nie;
        }

        async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync(Func<NetworkEndpoint, bool> predicate)
        {
            var endpoints = await reader.GetEndpointsAsync();
            return endpoints.Where(predicate);
        }

        public async Task<UpdateResult<NetworkEndpoint>> UpdateEndpointAsync(NetworkEndpoint item)
        {
            validator.Validate(item);
            var result = await updater.UpdateEndpointAsync(item);
            cache.Put(result.New);
            log.LogInformation("Updated NetworkEndpoint. Result:{@Result}", result);
            return result;
        }

        public async Task<UpdateResult<NetworkIdentity>> UpdateIdentityAsync(NetworkIdentity id)
        {
            Ensure.NotNull(id, nameof(id));
            Ensure.NotNullOrWhitespace(id.Name, nameof(id.Name));

            try
            {
                var result = await updater.UpdateIdentityAsync(id);
                log.LogInformation("Update NetworkIdentity. Swap:{@Swap}", result);
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update NetworkIdentity. Identity:{@Identity} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }
    }
}
