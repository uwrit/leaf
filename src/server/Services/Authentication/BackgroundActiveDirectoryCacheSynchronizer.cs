// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Data.SqlClient;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Options;
using Services.Authorization;

namespace Services.Authentication
{
    public class BackgroundActiveDirectoryCacheSynchronizer : BackgroundService
    {
        readonly ActiveDirectoryCache adCache;
        readonly ActiveDirectoryService adService;
        readonly ILogger<BackgroundActiveDirectoryCacheSynchronizer> logger;

        public BackgroundActiveDirectoryCacheSynchronizer(
            ActiveDirectoryCache activeDirectoryCache,
            ActiveDirectoryService activeDirectoryService,
            ILogger<BackgroundActiveDirectoryCacheSynchronizer> logger
        )
        {
            adCache = activeDirectoryCache;
            adService = activeDirectoryService;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundActiveDirectoryCacheSynchronizer is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundActiveDirectoryCacheSynchronizer is stopping");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var users = adService.GetMembers(adCache.Users.Name);
                    adCache.Users.Overwrite(users);

                    var supers = adService.GetMembers(adCache.Supers.Name);
                    adCache.Supers.Overwrite(supers);

                    var admins = adService.GetMembers(adCache.Admins.Name);
                    adCache.Admins.Overwrite(admins);
                }
                catch (Exception e)
                {
                    logger.LogError("Could not refresh ActiveDirectoryCache. Error: {Error}", e.ToString());
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }


            logger.LogInformation("BackgroundActiveDirectoryCacheSynchronizer is stopped");
        }
    }
}
