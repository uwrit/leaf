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
    public class BackgroundAppStateSynchronizer : BackgroundService
    {
        readonly IAppStateCache cache;
        readonly IAppStateProvider appStateProvider;
        readonly ILogger<BackgroundInvalidatedTokenSynchronizer> logger;

        public BackgroundAppStateSynchronizer(
            IAppStateCache cache,
            IAppStateProvider appStateProvider,
            ILogger<BackgroundInvalidatedTokenSynchronizer> logger)
        {
            this.cache = cache;
            this.appStateProvider = appStateProvider;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundAppStateSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundAppStateSynchronizer is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var newState = await appStateProvider.GetAppState();
                    cache.Overwrite(newState);
                    logger.LogInformation("Refreshed AppState");
                }
                catch (Exception e)
                {
                    logger.LogError("Failed to refresh AppStateCache. Error: {Error}", e.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            logger.LogInformation("BackgroundAppStateSynchronizer is stopped");
        }
    }
}
