// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    public class BackgroundTokenBlacklistSynchronizer : BackgroundService
    {
        readonly ITokenBlacklistCache cache;
        readonly ITokenBlacklistService tokenBlacklistService;
        readonly ILogger<BackgroundTokenBlacklistSynchronizer> logger;

        public BackgroundTokenBlacklistSynchronizer(
            ITokenBlacklistCache cache,
            ITokenBlacklistService tokenBlacklistService,
            ILogger<BackgroundTokenBlacklistSynchronizer> logger)
        {
            this.cache = cache;
            this.tokenBlacklistService = tokenBlacklistService;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundTokenBlacklistSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundTokenBlacklistSynchronizer is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var list = await tokenBlacklistService.GetBlacklist();
                    cache.Overwrite(list);
                    logger.LogInformation("Refreshed TokenBlacklistCache");
                }
                catch (Exception e)
                {
                    logger.LogError("Could not refresh TokenBlacklistCache. Error: {Error}", e.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
            }

            logger.LogInformation("BackgroundTokenBlacklistSynchronizer is stopped");
        }
    }
}
