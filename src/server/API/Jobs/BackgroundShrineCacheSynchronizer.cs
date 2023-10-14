// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Integration.Shrine;
using System.Threading;
using System.Threading.Tasks;

namespace API.Jobs
{
    public class BackgroundShrineCacheSynchronizer : BackgroundService
    {
        readonly ILogger<BackgroundShrinePollingService> logger;
        readonly IShrineQueryResultCache queryResultCache;
        readonly IShrineUserQueryCache userQueryCache;
        readonly int cacheDeleteFrequencyMinutes = 60;

        DateTime? lastCacheDelete;

        public BackgroundShrineCacheSynchronizer(
            ILogger<BackgroundShrinePollingService> logger,
            IShrineQueryResultCache queryResultCache,
            IShrineUserQueryCache userQueryCache)
        {
            this.logger = logger;
            this.queryResultCache = queryResultCache;
            this.userQueryCache = userQueryCache;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundShrineCacheSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundShrineCacheSynchronizer is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    if (lastCacheDelete == null) continue;
                    logger.LogInformation($"BackgroundShrineCacheSynchronizer will delete old cached records older than {cacheDeleteFrequencyMinutes} minutes");

                    var resultCount = queryResultCache.DeleteOlderThan((DateTime)lastCacheDelete);
                    var queryCount = userQueryCache.DeleteOlderThan((DateTime)lastCacheDelete);
                    lastCacheDelete = DateTime.Now;

                    logger.LogInformation("BackgroundShrineCacheSynchronizer deleted {resultCount} results and {queryCount} queries", resultCount, queryCount);
                }
                catch (Exception ex)
                {
                    logger.LogError("BackgroundShrineCacheSynchronizer failed to clear caches. Error: {Error}", ex.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromMinutes(cacheDeleteFrequencyMinutes));
                }
            }
        }
    }
}

