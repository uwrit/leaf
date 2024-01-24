// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Cohort;
using Model.Compiler;
using Model.Options;
using Hl7.Fhir.Rest;
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Asn1.Ocsp;

namespace Services.Cohort
{
    public class FhirCohortService : CohortCounter.IPatientCohortService
    {
        readonly PatientCountAggregator patientCountAggregator;
        readonly ClinDbOptions clinDbOpts;
        //readonly BaseFhirClient client;
        readonly HttpClient client;

        public FhirCohortService(
            PatientCountAggregator patientCountAggregator,
            IOptions<ClinDbOptions> clinDbOpts,
            HttpClient client,
            ILogger<FhirCohortService> logger)
        {
            this.patientCountAggregator = patientCountAggregator;
            this.clinDbOpts = clinDbOpts.Value;
            this.client = client;

            /*
            this.client = new FhirClient(
                clinDbOpts.Value.Fhir.ApiURI,
                new FhirClientSettings
                {
                    Timeout = clinDbOpts.Value.DefaultTimeout,
                    PreferredFormat = ResourceFormat.Json
                })
                .WithOstrichModeSerializer();
            */
        }

        public async Task<PatientCohort> GetPatientCohortAsync(PatientCountQuery query, CancellationToken token)
        {
            return new PatientCohort
            {
                QueryId = query.QueryId,
                PatientIds = await GetPatientSetAsync(query.Panels, query.DependentQueryIds),
                SqlStatements = Array.Empty<string>(),
                Panels = query.Panels.Where(p => p.Domain == PanelDomain.Panel)
            };
        }

        async Task<HashSet<string>> GetPatientSetAsync(IEnumerable<Panel> queries, IEnumerable<Guid> dependentQueryIds)
        {
            var partials = new ConcurrentBag<PartialPatientCountContext>();
            var tasks = new List<Task>();
            using (var throttler = new SemaphoreSlim(clinDbOpts.Cohort.MaxParallelThreads))
            {
                foreach (var q in queries)
                {
                    await throttler.WaitAsync();
                    tasks.Add(
                        Task.Run(async () =>
                        {
                            var result = await GetPartialContext(q);
                            throttler.Release();
                            partials.Add(result);
                        })
                    );
                }
                await Task.WhenAll(tasks);
            }
            //token.ThrowIfCancellationRequested();

            return patientCountAggregator.Aggregate(partials);
        }

        static string ParsePatientId(JObject entry)
        {
            var resource = entry["resource"];
            var type = (string)resource["resourceType"];

            if (type == "Person" || type == "Patient")
            {
                return (string)resource["id"];
            }
            else
            {
                foreach (var field in new string[] { "subject", "patient" })
                {
                    var id = resource[field];
                    if (id != null)
                    {
                        var ident = (string)resource[field]["reference"];
                        if (ident.StartsWith("Patient/"))
                        {
                            ident = ident.Split('/').Last();
                            return ident;
                        }
                    }
                }
            }

            return null;
        }

        async Task<PartialPatientCountContext> GetPartialContext(Panel query)
        {
            var partialIds = new HashSet<string>();

            try
            {
                var requests = new string[]
                {
                    //"Person?birthdate=gt1999-09-13",
                    //"Condition?code:text=headache",
                    "Condition?code=http://snomed.info/sct|22298006"
                };
                foreach (var apiCall in requests)
                {
                    var url = $"{clinDbOpts.Fhir.ApiURI}/{apiCall}&_count=1000&_elements=id,subject,patient";

                    while (true)
                    {
                        var hasNext = false;
                        using (var request = new HttpRequestMessage { RequestUri = new Uri(url) })
                        {
                            var response = await client.SendAsync(request);
                            if (response.IsSuccessStatusCode)
                            {
                                var content = await response.Content.ReadAsStringAsync();
                                JObject jsonObj = JObject.Parse(content);
                                Dictionary<string, object> dictObj = jsonObj.ToObject<Dictionary<string, object>>();

                                foreach (JObject entry in ((JArray)dictObj["entry"]).Cast<JObject>())
                                {
                                    var id = ParsePatientId(entry);
                                    if (id != null) partialIds.Add(id);
                                }

                                if (dictObj.ContainsKey("link"))
                                {
                                    foreach (JObject link in ((JArray)dictObj["link"]).Cast<JObject>())
                                    {
                                        var relation = (string)link["relation"];
                                        if (relation == "next")
                                        {
                                            url = (string)link["url"];
                                            hasNext = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!hasNext) break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                var x = 1;
            }

            return new PartialPatientCountContext
            {
                PatientIds = partialIds,
                IsInclusionCriteria = query.IncludePanel
            };
        }
    }
}
