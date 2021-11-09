// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Authentication;

namespace API.Jobs
{
    public class BackgroundTokenInvalidatedSynchronizer : BackgroundService
    {
        readonly ITokenInvalidatedCache cache;
        readonly ITokenInvalidatedService tokenInvalidatedService;
        readonly ILogger<BackgroundTokenInvalidatedSynchronizer> logger;

        public BackgroundTokenInvalidatedSynchronizer(
            ITokenInvalidatedCache cache,
            ITokenInvalidatedService tokenInvalidatedService,
            ILogger<BackgroundTokenInvalidatedSynchronizer> logger)
        {
            this.cache = cache;
            this.tokenInvalidatedService = tokenInvalidatedService;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundTokenInvalidatedSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundTokenInvalidatedSynchronizer is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var list = await tokenInvalidatedService.GetInvalidated();
                    cache.Overwrite(list);
                    logger.LogInformation("Refreshed TokenInvalidatedCache");
                }
                catch (Exception e)
                {
                    logger.LogError("Failed to refresh TokenInvalidatedCache. Error: {Error}", e.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
            }

            logger.LogInformation("BackgroundTokenInvalidatedSynchronizer is stopped");
        }
    }
}
