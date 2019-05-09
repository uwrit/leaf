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
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Results;
using System.Threading.Tasks;

namespace Tests
{
    public class NetworkEndpointProviderTests
    {
        static LoggerFactory factory = new LoggerFactory();
        static ILogger<NetworkEndpointProvider> GetLogger() => new Logger<NetworkEndpointProvider>(factory);

        static NetworkEndpointProvider GetProvider(IEnumerable<NetworkEndpoint> endpoints, NetworkIdentity identity)
        {
            return new NetworkEndpointProvider(
                new MockNetworkEndpointService(endpoints, identity),
                new NetworkValidator(Options.Create(new NetworkValidationOptions
                {
                    EnsureHttps = true
                })),
                GetLogger()
            );
        }

        // TODO(cspital) start tests here to ensure validation and correct filtering occurs
    }

    class MockNetworkEndpointService : INetworkEndpointService
    {
        readonly IEnumerable<NetworkEndpoint> endpoints;
        readonly NetworkIdentity identity;

        public MockNetworkEndpointService(IEnumerable<NetworkEndpoint> endpoints, NetworkIdentity identity)
        {
            this.endpoints = endpoints;
            this.identity = identity;
        }

        public Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            return Task.FromResult(endpoints);
        }

        public Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            return Task.FromResult(new NetworkIdentityEndpoints
            {
                Identity = identity,
                Endpoints = endpoints
            });
        }

        public Task<NetworkIdentity> GetIdentityAsync()
        {
            return Task.FromResult(identity);
        }

        public Task<UpdateResult<NetworkEndpoint>> UpdateAsync(NetworkEndpoint endpoint)
        {
            var old = endpoints.FirstOrDefault(e => e.Id == endpoint.Id);
            return Task.FromResult(new UpdateResult<NetworkEndpoint>
            {
                Old = old,
                New = endpoint
            });
        }
    }
}
