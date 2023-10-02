// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace API.Jobs
{
	public class ShrineHubReader : BackgroundService
    {
        readonly ILogger<ShrineHubReader> logger;

        public ShrineHubReader(
            ILogger<ShrineHubReader> logger)
		{
            this.logger = logger;
		}

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("ShrineHubReader is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("ShrineHubReader is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    logger.LogInformation("Syncronizing with SHRINE");
                    //var newState = await serverStateProvider.GetServerState();
                    //cache.Overwrite(newState);
                }
                catch (Exception e)
                {
                    logger.LogError("Failed to syncronize with SHRINE. Error: {Error}", e.ToString());
                }
                finally
                {
                    // No need to delay next poll on Leaf end. SHRINE already long polls on other side
                }
            }

            logger.LogInformation("ShrineHubReader is stopped");
        }
    }
}

