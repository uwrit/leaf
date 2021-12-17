// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
    public class BackgroundInvalidatedTokenSynchronizer : BackgroundService
    {
        readonly IInvalidatedTokenCache cache;
        readonly IInvalidatedTokenService tokenInvalidatedService;
        readonly ILogger<BackgroundInvalidatedTokenSynchronizer> logger;

        public BackgroundInvalidatedTokenSynchronizer(
            IInvalidatedTokenCache cache,
            IInvalidatedTokenService tokenInvalidatedService,
            ILogger<BackgroundInvalidatedTokenSynchronizer> logger)
        {
            this.cache = cache;
            this.tokenInvalidatedService = tokenInvalidatedService;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundInvalidatedTokenSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundInvalidatedTokenSynchronizer is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var list = await tokenInvalidatedService.GetInvalidated();
                    cache.Overwrite(list);
                    logger.LogInformation("Refreshed InvalidatedTokenCache");
                }
                catch (Exception e)
                {
                    logger.LogError("Failed to refresh InvalidatedTokenCache. Error: {Error}", e.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
            }

            logger.LogInformation("BackgroundInvalidatedTokenSynchronizer is stopped");
        }
    }
}
