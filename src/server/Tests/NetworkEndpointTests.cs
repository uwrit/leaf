// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Network;
using Model.Options;
using Model.Admin.Network;
using Xunit;

namespace Tests
{
    public class NetworkEndpointProviderTests
    {
        [Fact]
        public void GetEndpoints_Should_Only_Return_Active_HTTPS_Endpoints()
        {
            var provider = GetProvider(MixedEndpoints);

            var https = provider.GetEndpointsAsync().Result;

            Assert.All(https, e => Assert.True(e.Address.Scheme == Uri.UriSchemeHttps && (e.IsInterrogator || e.IsResponder)));
        }

        [Fact]
        public void GetEndpointsWithIdentity_Should_Only_Return_Active_HTTPS_Endpoints()
        {
            var provider = GetProvider(MixedEndpoints);

            var result = provider.GetEndpointsWithIdentityAsync().Result;

            Assert.All(result.Endpoints, e => Assert.True(e.Address.Scheme == Uri.UriSchemeHttps && (e.IsInterrogator || e.IsResponder)));
        }

        [Fact]
        public void GetResponders_Should_Only_Return_HTTPS_Responders_Endpoints()
        {
            var provider = GetProvider(MixedEndpoints);

            var endpoints = provider.GetRespondersAsync().Result;

            Assert.All(endpoints, e => Assert.True(e.IsResponder && e.Address.Scheme == Uri.UriSchemeHttps));
        }

        [Fact]
        public void GetRespondersWithIdentity_Should_Only_Return_HTTPS_Responders_Endpoints()
        {
            var provider = GetProvider(MixedEndpoints);

            var result = provider.GetRespondersWithIdentityAsync().Result;

            Assert.All(result.Endpoints, e => Assert.True(e.IsResponder && e.Address.Scheme == Uri.UriSchemeHttps));
        }

        [Fact]
        public void GetInterrogators_Should_Only_Return_HTTPS_Responders_Endpoints()
        {
            var provider = GetProvider(MixedEndpoints);

            var endpoints = provider.GetInterrogatorsAsync().Result;

            Assert.All(endpoints, e => Assert.True(e.IsInterrogator && e.Address.Scheme == Uri.UriSchemeHttps));
        }

        [Fact]
        public void GetInterrogatorsWithIdentity_Should_Only_Return_HTTPS_Responders_Endpoints()
        {
            var provider = GetProvider(MixedEndpoints);

            var result = provider.GetInterrogatorsWithIdentityAsync().Result;

            Assert.All(result.Endpoints, e => Assert.True(e.IsInterrogator && e.Address.Scheme == Uri.UriSchemeHttps));
        }

        static readonly LoggerFactory factory = new LoggerFactory();
        static ILogger<NetworkEndpointProvider> GetLogger() => new Logger<NetworkEndpointProvider>(factory);

        static NetworkEndpointProvider GetProvider(IEnumerable<NetworkEndpoint> endpoints = null, NetworkIdentity identity = null)
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

        static readonly IEnumerable<NetworkEndpoint> MixedEndpoints = new NetworkEndpoint[]
            {
                new NetworkEndpoint { Id = 1, Name = "Site1", Address = new Uri("https://leaf.site1.tld"), IsResponder = true, IsInterrogator = true },
                new NetworkEndpoint { Id = 2, Name = "Site2", Address = new Uri("https://leaf.site2.tld"), IsResponder = true, IsInterrogator = true },
                new NetworkEndpoint { Id = 3, Name = "Site3", Address = new Uri("https://leaf.site3.tld"), IsResponder = false, IsInterrogator = true },
                new NetworkEndpoint { Id = 4, Name = "Site4", Address = new Uri("https://leaf.site4.tld"), IsResponder = true, IsInterrogator = false },
                new NetworkEndpoint { Id = 5, Name = "Site5", Address = new Uri("http://leaf.site5.tld"), IsResponder = true, IsInterrogator = true },
                new NetworkEndpoint { Id = 6, Name = "Site6", Address = new Uri("https://leaf.site6.tld"), IsResponder = false, IsInterrogator = false },
            };
    }

    public class AdminNetworkEndpointManagerTests
    {
        [Fact]
        public void GetEndpoints_Should_Return_All_Endpoints()
        {
            var manager = GetManager(MixedEndpoints);

            var endpoints = manager.GetEndpointsAsync().Result;

            Assert.Equal(MixedEndpoints.Count(), endpoints.Count());
        }

        [Fact]
        public void GetEndpointsWithIdentity_Should_Return_All_Endpoints()
        {
            var manager = GetManager(MixedEndpoints);

            var result = manager.GetEndpointsWithIdentityAsync().Result;

            Assert.Equal(MixedEndpoints.Count(), result.Endpoints.Count());
        }

        [Fact]
        public void GetResponders_Should_Only_Return_Responders_Endpoints()
        {
            var manager = GetManager(MixedEndpoints);

            var endpoints = manager.GetRespondersAsync().Result;

            Assert.All(endpoints, e => Assert.True(e.IsResponder));
        }

        [Fact]
        public void GetRespondersWithIdentity_Should_Only_Return_Responders_Endpoints()
        {
            var manager = GetManager(MixedEndpoints);

            var result = manager.GetRespondersWithIdentityAsync().Result;

            Assert.All(result.Endpoints, e => Assert.True(e.IsResponder));
        }

        [Fact]
        public void GetInterrogators_Should_Only_Return_HTTPS_Responders_Endpoints()
        {
            var manager = GetManager(MixedEndpoints);

            var endpoints = manager.GetInterrogatorsAsync().Result;

            Assert.All(endpoints, e => Assert.True(e.IsInterrogator));
        }

        [Fact]
        public void GetInterrogatorsWithIdentity_Should_Only_Return_HTTPS_Responders_Endpoints()
        {
            var manager = GetManager(MixedEndpoints);

            var result = manager.GetInterrogatorsWithIdentityAsync().Result;

            Assert.All(result.Endpoints, e => Assert.True(e.IsInterrogator));
        }

        [Fact]
        public void UpdateEndpointAsync_Should_Throw_On_NonHTTPS()
        {
            var manager = GetManager(MixedEndpoints);
            var update = new NetworkEndpoint { Id = 4, Name = "Site4", Issuer = "urn:leaf:iss:site4", Address = new Uri("http://leaf.site4.tld"), IsResponder = true, IsInterrogator = true };

            Assert.ThrowsAsync<UriFormatException>(() => manager.UpdateEndpointAsync(update));
        }

        [Fact]
        public void UpdateEndpointAsync_Should_Update_HTTPS_Endpoint()
        {
            var manager = GetManager(MixedEndpoints);
            var update = new NetworkEndpoint { Id = 4, Name = "Site4", Issuer = "urn:leaf:iss:site4", Address = new Uri("https://leaf.site4.tld"), KeyId = "12309123khjg423khj4g", Certificate = new byte[] { }, IsResponder = true, IsInterrogator = true };

            var updated = manager.UpdateEndpointAsync(update).Result;

            Assert.Equal(4, update.Id);
            Assert.True(updated.IsInterrogator);
        }

        [Fact]
        public void UpdateEndpointAsync_Should_Throw_On_Null_Address()
        {
            var manager = GetManager(MixedEndpoints);
            var update = new NetworkEndpoint { Id = 4, Name = "Site4", Issuer = "urn:leaf:iss:site4", Address = null, IsResponder = true, IsInterrogator = true };

            Assert.ThrowsAsync<ArgumentNullException>(() => manager.UpdateEndpointAsync(update));
        }

        static readonly LoggerFactory factory = new LoggerFactory();
        static ILogger<AdminNetworkEndpointManager> GetLogger() => new Logger<AdminNetworkEndpointManager>(factory);

        static AdminNetworkEndpointManager GetManager(IEnumerable<NetworkEndpoint> endpoints = null, NetworkIdentity identity = null)
        {
            var svc = new MockNetworkEndpointService(endpoints, identity);
            return new AdminNetworkEndpointManager(
                svc,
                svc,
                new NetworkEndpointCache(endpoints),
                new NetworkValidator(Options.Create(new NetworkValidationOptions
                {
                    EnsureHttps = true
                })),
                GetLogger()
            );
        }

        static readonly IEnumerable<NetworkEndpoint> MixedEndpoints = new NetworkEndpoint[]
            {
                new NetworkEndpoint { Id = 1, Name = "Site1", Issuer = "urn:leaf:iss:site1", Address = new Uri("https://leaf.site1.tld"), IsResponder = true, IsInterrogator = true },
                new NetworkEndpoint { Id = 2, Name = "Site2", Issuer = "urn:leaf:iss:site2", Address = new Uri("https://leaf.site2.tld"), IsResponder = true, IsInterrogator = true },
                new NetworkEndpoint { Id = 3, Name = "Site3", Issuer = "urn:leaf:iss:site3", Address = new Uri("https://leaf.site3.tld"), IsResponder = false, IsInterrogator = true },
                new NetworkEndpoint { Id = 4, Name = "Site4", Issuer = "urn:leaf:iss:site4", Address = new Uri("https://leaf.site4.tld"), IsResponder = true, IsInterrogator = false },
                new NetworkEndpoint { Id = 5, Name = "Site5", Issuer = "urn:leaf:iss:site5", Address = new Uri("http://leaf.site5.tld"), IsResponder = true, IsInterrogator = true },
                new NetworkEndpoint { Id = 6, Name = "Site6", Issuer = "urn:leaf:iss:site6", Address = new Uri("https://leaf.site6.tld"), IsResponder = false, IsInterrogator = false },
            };
    }

    class MockNetworkEndpointService : NetworkEndpointProvider.INetworkEndpointReader, AdminNetworkEndpointManager.IAdminNetworkUpdater
    {
        readonly Dictionary<int, NetworkEndpoint> endpoints;
        NetworkIdentity identity;

        public MockNetworkEndpointService(IEnumerable<NetworkEndpoint> endpoints, NetworkIdentity identity)
        {
            this.endpoints = endpoints.ToDictionary(e => e.Id);
            this.identity = identity;
        }

        public Task<NetworkEndpoint> CreateEndpointAsync(NetworkEndpoint endpoint)
        {
            endpoints.Add(endpoint.Id, endpoint);
            return Task.FromResult(endpoint);
        }

        public Task<NetworkEndpoint> DeleteEndpointAsync(int id)
        {
            endpoints.TryGetValue(id, out var ep);
            endpoints.Remove(id);
            return Task.FromResult(ep);
        }

        public Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            return Task.FromResult(endpoints.Values.AsEnumerable());
        }

        public Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            return Task.FromResult(new NetworkIdentityEndpoints
            {
                Identity = identity,
                Endpoints = endpoints.Values
            });
        }

        public Task<NetworkIdentity> GetIdentityAsync()
        {
            return Task.FromResult(identity);
        }

        public Task<NetworkEndpoint> UpdateEndpointAsync(NetworkEndpoint endpoint)
        {
            endpoints[endpoint.Id] = endpoint;

            return Task.FromResult(endpoint);
        }

        public Task<NetworkIdentity> UpdateIdentityAsync(NetworkIdentity identity)
        {
            this.identity = identity;

            return Task.FromResult(identity);
        }
    }
}
