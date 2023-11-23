// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Integration.Shrine;
using API.DTO.Cohort;
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
using Model.Compiler;
using Model.Options;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Serialization;

namespace API.Jobs
{
    public class BackgroundShrinePollingService : BackgroundService
    {
        readonly ILogger<BackgroundShrinePollingService> logger;
        readonly IShrineMessageBroker broker;
        readonly IShrineQueryResultCache queryResultCache;
        readonly IShrineUserQueryCache userQueryCache;
        readonly IServiceScopeFactory serviceScopeFactory;
        readonly SHRINEOptions opts;
        readonly ShrineQueryDefinitionConverter converter;
        readonly int ErrorPauseSeconds = 30;
        readonly JsonSerializerSettings serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public BackgroundShrinePollingService(
            ILogger<BackgroundShrinePollingService> logger,
            IShrineMessageBroker broker,
            IShrineQueryResultCache queryResultCache,
            IShrineUserQueryCache userQueryCache,
            IServiceScopeFactory serviceScopeFactory,
            IOptions<IntegrationOptions> opts,
            ShrineQueryDefinitionConverter converter
            )
        {
            this.logger = logger;
            this.broker = broker;
            this.queryResultCache = queryResultCache;
            this.userQueryCache = userQueryCache;
            this.serviceScopeFactory = serviceScopeFactory;
            this.converter = converter;
            this.opts = opts.Value.SHRINE;
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
                                try
                                {
                                    var dto = JsonConvert.DeserializeObject<ShrineRunQueryForResultDTO>(message.Contents);
                                    var run = dto.ToRunQueryForResult();
                                    await HandleRunQueryForResultMessage(run, stoppingToken);
                                }
                                catch (JsonSerializationException ex)
                                {
                                    logger.LogError("BackgroundShrinePollingService failed to parse SHRINE message. Error: {Error}", ex.ToString());
                                }
                                catch (Exception ex)
                                {
                                    logger.LogError("BackgroundShrinePollingService failed to parse SHRINE message. Error: {Error}", ex.ToString());
                                }
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
                    logger.LogInformation($"BackgroundShrinePollingService pausing {ErrorPauseSeconds} seconds.");
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
            // Let hub know query received
            await SendQueryReceievedByAdapter(run.Query.Id);

            // Get user context, convert query
            var (user, query) = GetContext(run);

            // Let hub know query converted, executing
            await SendQuerySubmittedToCrc(run.Query.Id);

            // Create scope to ensure query run as this user
            using (var scope = serviceScopeFactory.CreateAsyncScope())
            {
                var userContextProvider = scope.ServiceProvider.GetRequiredService<IUserContextProvider>();
                userContextProvider.SetUserContext(user);
                var counter = scope.ServiceProvider.GetRequiredService<CohortCounter>();

                var cohort = await counter.Count(query, stoppingToken);
                var count = new CohortCountDTO(cohort);

                if (!cohort.ValidationContext.PreflightPassed)
                {
                    // TODO Respond with error
                }

                queryResultCache.Put(run.Query.Id, run.Researcher);

                // Let hub know query result
                await SendQueryResult(run.Query.Id, count);
            }
        }

        async Task SendQueryResult(long queryId, CohortCountDTO count)
        {
            var message = new ShrineUpdateResultWithCrcResult
            {
                QueryId = queryId,
                AdapterNodeKey = opts.Node.Key,
                Count = count.Result.Value,
                CrcQueryInstanceId = 42,
                Breakdowns = null,
                ObfuscatingParameters = new ShrineResultObfuscatingParameters
                {
                    BinSize = 5,
                    StdDev = 6.5M,
                    NoiseClamp = 10,
                    LowLimit = 10
                },
                Status = new ShrineQueryStatus { EncodedClass = ShrineQueryStatusType.ResultFromCRC },
                StatusMessage = "FINISHED",
                AdapterTime = DateTime.Now,
                EncodedClass = ShrineQueryStatusType.UpdateResultWithCrcResult
            };
            var dto = new ShrineUpdateResultWithCrcResultDTO(message);

            var response = new ShrineDeliveryContents
            {
                ContentsSubject = queryId,
                Contents = JsonConvert.SerializeObject(dto, serializerSettings),
                ContentsType = ShrineDeliveryContentsType.UpdateResult
            };
            _ = await broker.SendMessageToHub(response);
        }

        async Task SendQueryReceievedByAdapter(long queryId)
        {
            await SendQueryReceivedMessage(queryId, ShrineQueryStatusType.ReceivedByAdapter, ShrineQueryStatusType.UpdateResultWithProgress);
        }

        async Task SendQuerySubmittedToCrc(long queryId)
        {
            await SendQueryReceivedMessage(queryId, ShrineQueryStatusType.SubmittedToCRC, ShrineQueryStatusType.UpdateResultWithProgress);
        }

        async Task SendQueryReceivedMessage(long queryId, ShrineQueryStatusType innerClass, ShrineQueryStatusType outerClass)
        {
            var message = new ShrineUpdateResultWithProgress
            {
                QueryId = queryId,
                AdapterNodeKey = opts.Node.Key,
                Status = new ShrineQueryStatus { EncodedClass = innerClass },
                AdapterTime = DateTime.Now,
                EncodedClass = outerClass
            };
            var dto = new ShrineUpdateResultWithProgressDTO(message);

            var response = new ShrineDeliveryContents
            {
                ContentsSubject = queryId,
                Contents = JsonConvert.SerializeObject(dto, serializerSettings),
                ContentsType = ShrineDeliveryContentsType.UpdateResult
            };
            _ = await broker.SendMessageToHub(response);
        }

        (IUserContext, IPatientCountQueryDTO) GetContext(ShrineRunQueryForResult run)
        {
            var cached = userQueryCache.GetOrDefault(run.Query.Id);

            // If run by a Leaf user, grab from cache
            if (cached != null)
            {
                return (cached.User, cached.Query);
            }

            // Else not from Leaf, so set user context and transform query defintion
            return (new ShrineUserContext(run.Researcher), converter.ToLeafQuery(run.Query));
        }
    }
}

