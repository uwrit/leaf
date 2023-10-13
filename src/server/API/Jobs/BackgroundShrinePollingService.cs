// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Integration.Shrine;
using API.Authorization;
using API.Integration.Shrine;
using API.Integration.Shrine4_1;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Cohort;
using Model.Integration.Shrine;
using Newtonsoft.Json;
using API.DTO.Cohort;
using Model.Compiler;

namespace API.Jobs
{
    public class BackgroundShrinePollingService : BackgroundService
    {
        readonly ILogger<BackgroundShrinePollingService> logger;
        readonly IShrineMessageBroker broker;
        readonly IShrineQueryResultCache queryResultCache;
        readonly IShrineUserQueryCache userQueryCache;
        readonly IServiceScopeFactory serviceScopeFactory;
        readonly CohortCounter counter;
        readonly ShrineQueryDefinitionConverter converter;
        readonly int ErrorPauseSeconds = 30;

        public BackgroundShrinePollingService(
            ILogger<BackgroundShrinePollingService> logger,
            IShrineMessageBroker broker,
            IShrineQueryResultCache queryResultCache,
            IShrineUserQueryCache userQueryCache,
            IServiceScopeFactory serviceScopeFactory,
            ShrineQueryDefinitionConverter converter,
            CohortCounter counter
            )
        {
            this.logger = logger;
            this.broker = broker;
            this.queryResultCache = queryResultCache;
            this.userQueryCache = userQueryCache;
            this.serviceScopeFactory = serviceScopeFactory;
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
                    var (response, message) = await broker.ReadHubMessageAndAcknowledge();
                    if (message == null)
                    {
                        if (!response.IsSuccessStatusCode)
                        {
                            // Error, delay before next poll
                            await Task.Delay(TimeSpan.FromSeconds(ErrorPauseSeconds), stoppingToken);
                        }
                    }

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
            IUserContext user;
            IPatientCountQueryDTO query;
            var cached = userQueryCache.GetOrDefault(run.Query.Id);

            // If run by a Leaf user, grab from cache
            if (cached != null)
            {
                user = cached.User;
                query = cached.Query;
            }

            // Else not from Leaf, so set user context and transform query defintion
            else
            {
                user = new ShrineUserContext(run.Researcher);
                query = converter.ToLeafQuery(run.Query);
            }

            // Create scope to ensure query run as this user
            using (var scope = serviceScopeFactory.CreateAsyncScope())
            {
                var userContextProvider = scope.ServiceProvider.GetRequiredService<UserContextProvider>();
                userContextProvider.SetUserContext(user);
                queryResultCache.Put(run.Query.Id, run.Researcher);

                var cohort = await counter.Count(query, stoppingToken);
                var count = new CohortCountDTO(cohort);

                if (!cohort.ValidationContext.PreflightPassed)
                {
                    // TODO Respond with error
                }

                var response = new ShrineDeliveryContents
                {
                    // TODO Respond with count in SHRINE format
                };
                // _ = await broker.SendMessageToHub()
            }
        }
    }
}

