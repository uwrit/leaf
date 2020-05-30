// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Network;
using Model.Admin.Network;

// NOTE(cspital) this does not support clustered deployments yet....Redis impl incoming soon

namespace API.Jobs
{
    public class BackgroundCertificateSynchronizer : BackgroundService
    {
        readonly INetworkEndpointRefresher refresher;
        readonly INetworkEndpointCache cache;
        readonly AdminNetworkEndpointManager endpointManager;
        readonly NetworkEndpointConcurrentQueueSet queue;
        readonly ILogger<BackgroundCertificateSynchronizer> log;

        public BackgroundCertificateSynchronizer(
            INetworkEndpointRefresher refresher,
            INetworkEndpointCache cache,
            AdminNetworkEndpointManager endpointManager,
            NetworkEndpointConcurrentQueueSet queue,
            ILogger<BackgroundCertificateSynchronizer> logger)
        {
            this.refresher = refresher;
            this.cache = cache;
            this.endpointManager = endpointManager;
            this.queue = queue;
            log = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            log.LogInformation("BackgroundCertificateSynchronizer is starting");
            stoppingToken.Register(() =>
            {
                log.LogInformation("BackgroundCertificateSynchronizer is stopping");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                if (!queue.IsEmpty)
                {
                    var stales = queue.Drain();
                    log.LogInformation("Refreshing interrogators. Count:{Count}", stales.Count());

                    await RefreshStaleEndpoints(stales);
                }

                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }

            log.LogInformation("BackgroundCertificateSynchronizer is stopped.");
        }

        async Task<IEnumerable<NetworkEndpoint>> RefreshStaleEndpoints(IEnumerable<NetworkEndpoint> stale)
        {
            var refreshing = stale.Select(async (NetworkEndpoint oldState) =>
            {
                var newState = oldState;
                try
                {
                    newState = await refresher.Refresh(oldState);
                    log.LogInformation("Refreshed NetworkEndpoint. Endpoint:{@Endpoint}", newState);

                    var updated = await endpointManager.UpdateEndpointAsync(newState);
                    newState = updated;
                    if (newState != null)
                    {
                        cache.Put(newState);
                    }
                    log.LogInformation("Updated NetworkEndpoint. Old:{@{Old} New:{@New}", oldState, newState);
                }
                catch (HttpRequestException hre)
                {
                    log.LogError("Failed to refresh NetworkEndpoint. Endpoint:{@Endpoint} Error:{Error}", oldState, hre.Message);
                }
                catch (DbException se)
                {
                    log.LogError("Failed to update NetworkEndpoint. Old:{@Old} New:{@New} Error:{Error}", oldState, newState, se.Message);
                    cache.PopOrDefault(oldState.Issuer);
                }
                return newState;
            });

            return await Task.WhenAll(refreshing);
        }
    }
}
