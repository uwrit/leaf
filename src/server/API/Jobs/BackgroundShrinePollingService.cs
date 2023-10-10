// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Cohort;
using API.DTO.Integration.Shrine;
using API.Integration.Shrine;
using API.Integration.Shrine4_1;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Cohort;
using Model.Integration.Shrine;
using Newtonsoft.Json;

namespace API.Jobs
{
	public class BackgroundShrinePollingService : BackgroundService
    {
        readonly ILogger<BackgroundShrinePollingService> logger;
        readonly ShrineMessageBroker broker;
        readonly CohortCounter counter;
        readonly IShrineQueryResultCache queryResultCache;
        readonly ShrineQueryDefinitionConverter converter;
        readonly int ErrorPauseSeconds = 30;

        public BackgroundShrinePollingService(
            ILogger<BackgroundShrinePollingService> logger,
            ShrineQueryDefinitionConverter converter,
            ShrineMessageBroker broker,
            CohortCounter counter)
		{
            this.logger = logger;
            this.broker = broker;
            this.converter = converter;
            this.counter = counter;
		}

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("BackgroundShrinePollingService is starting");

            stoppingToken.Register(() =>
            {
                logger.LogInformation("BackgroundShrinePollingService is stopped");
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var message = await broker.ReadHubMessageAndAcknowledge();
                    if (message == null) continue;

                    _ = Task.Run(async () =>
                    {
                        switch (message.ContentsType)
                        {
                            case ShrineDeliveryContentsType.UpdateQueryAtQep:
                                var update = JsonConvert.DeserializeObject<ShrineUpdateQueryAtQepDTO>(message.Contents).ToUpdate();
                                HandleUpdateQueryAtQepMessage(update);
                                break;

                            case ShrineDeliveryContentsType.RunQueryForResult:
                                var run = JsonConvert.DeserializeObject<ShrineRunQueryForResult>(message.Contents);
                                await HandleRunQueryForResultMessage(run, stoppingToken);
                                break;

                            case ShrineDeliveryContentsType.Result:
                                var result = JsonConvert.DeserializeObject<ShrineResultProgressDTO>(message.Contents).ToProgress();
                                HandleResultMessage(result);
                                break;

                            default:
                                break;
                        }
                    }, stoppingToken);
                }
                catch (JsonSerializationException e)
                {
                    logger.LogError("BackgroundShrinePollingService failed to parse SHRINE message. Error: {Error}", e.ToString());
                }
                catch (Exception e)
                {
                    logger.LogError("BackgroundShrinePollingService failed to synchronize with SHRINE. Error: {Error}", e.ToString());
                    logger.LogError($"BackgroundShrinePollingService pausing {ErrorPauseSeconds} seconds.");
                    await Task.Delay(TimeSpan.FromSeconds(ErrorPauseSeconds), stoppingToken);
                }
                finally
                {
                    // No need to delay next poll on Leaf end. SHRINE already long polls on other side
                }
            }

            logger.LogInformation("BackgroundShrinePollingService is stopped");
        }

        void HandleUpdateQueryAtQepMessage(ShrineUpdateQueryAtQep update)
        {
            if (update.ResultProgresses != null)
            {
                queryResultCache.Put(update.ToQueryResult());
            }
        }

        void HandleResultMessage(ShrineResultProgress progress)
        {
            queryResultCache.Put(progress);
        }

        async Task HandleRunQueryForResultMessage(ShrineRunQueryForResult run, CancellationToken stoppingToken)
        {
            var leafQuery = converter.ToLeafQuery(run.Query);
            var cohort = await counter.Count(leafQuery, stoppingToken);
            var count = new CohortCountDTO(cohort);

            if (!cohort.ValidationContext.PreflightPassed)
            {
                // Respond with error
            }
            // Respond with count
            var response = new ShrineDeliveryContents
            {
                // TODO
            };
            // _ = await broker.SendMessageToHub()
        }
    }
}

