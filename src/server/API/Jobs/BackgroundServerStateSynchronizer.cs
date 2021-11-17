// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Notification;

namespace API.Jobs
{
    public class BackgroundServerStateSynchronizer : BackgroundService
    {
        readonly IServerStateCache cache;
        readonly IServerStateProvider serverStateProvider;
        readonly ILogger<BackgroundInvalidatedTokenSynchronizer> logger;

        public BackgroundServerStateSynchronizer(
            IServerStateCache cache,
            IServerStateProvider serverStateProvider,
            ILogger<BackgroundInvalidatedTokenSynchronizer> logger)
        {
            this.cache = cache;
            this.serverStateProvider = serverStateProvider;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundServerStateSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundServerStateSynchronizer is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var newState = await serverStateProvider.GetServerState();
                    cache.Overwrite(newState);
                    logger.LogInformation("Refreshed ServerState");
                }
                catch (Exception e)
                {
                    logger.LogError("Failed to refresh ServerStateCache. Error: {Error}", e.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            logger.LogInformation("BackgroundServerStateSynchronizer is stopped");
        }
    }
}
