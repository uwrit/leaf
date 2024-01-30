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
using Newtonsoft.Json.Linq;
using Composure;

namespace Services.Cohort
{
    public class FhirCohortService : CohortCounter.IPatientCohortService
    {
        readonly PatientCountAggregator patientCountAggregator;
        readonly ClinDbOptions clinDbOpts;
        readonly HttpClient client;

        readonly string[] PatientIdentifiers = new string[] { Fields.Subject, Fields.Patient };
        readonly Shape[] NonLongitudinalResources = new Shape[] { Shape.Patient, Shape.Person };


        public FhirCohortService(
            PatientCountAggregator patientCountAggregator,
            IOptions<ClinDbOptions> clinDbOpts,
            HttpClient client,
            ILogger<FhirCohortService> logger)
        {
            this.patientCountAggregator = patientCountAggregator;
            this.clinDbOpts = clinDbOpts.Value;
            this.client = client;
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

            return patientCountAggregator.Aggregate(partials);
        }

        static string ParsePatientId(JObject entry)
        {
            var resource = entry[Fields.Resource];
            var type = (string)resource[Fields.ResourceType];

            if (type == Fields.Person || type == Fields.Patient)
            {
                return (string)resource[Fields.Id];
            }
            else
            {
                foreach (var field in new string[] { Fields.Subject, Fields.Patient })
                {
                    var id = resource[field];
                    if (id != null)
                    {
                        var ident = (string)resource[field][Fields.Reference];
                        if (ident != null && ident.ToLowerInvariant().Contains($"{Fields.Patient}/"))
                        {
                            ident = ident.Split('/').Last();
                            return ident;
                        }
                    }
                }
            }

            return null;
        }

        string ConstructSearchUrl(PanelItem pi, Panel panel)
        {
            var c = pi.Concept;
            var parameters = new List<string>();
            var elements = new List<string>();
            var isLongitudinal = NonLongitudinalResources.Contains(c.FhirResourceShapeId);
            var baseUrl = $"{clinDbOpts.Fhir.ApiURI}/{c.FhirResourceShapeId}?{c.FhirSearchParameters}";

            // Check longitudinal or not, set output fields depending
            if (isLongitudinal) elements.Add(Fields.Id);
            else elements.AddRange(new string[] { Fields.Person, Fields.Patient });

            // Add dates, if applicable
            if (panel.IsDateFiltered) parameters.Add(ConstructDateFilter(panel.DateFilter));

            // Add numeric filter, if applicable
            if (pi.UseNumericFilter) parameters.Add(ConstructNumericFilter(pi));

            return $"{baseUrl}&{string.Join('&', parameters)}&{Fields.Elements}={string.Join(',', elements)}&{Fields.Count}={clinDbOpts.Fhir.Count}";
        }

        static string ConstructDateFilter(DateBoundary filter)
        {
            var start = GetDateExpression(filter.Start, false);
            var end = GetDateExpression(filter.End, true);

            return $"date=ge{start}&date=lt{end}";
        }

        static string GetDateExpression(DateFilter filter, bool setToEndOfDay)
        {
            var defaultTime = new DateTime(filter.Date.Year, filter.Date.Month, filter.Date.Day, 0, 0, 0);
            var date = setToEndOfDay
                ? defaultTime.AddHours(23).AddMinutes(59).AddSeconds(59)
                : defaultTime;

            if (filter.DateIncrementType == DateIncrementType.Now)
            {
                return defaultTime.ToString();
            }
            if (filter.DateIncrementType == DateIncrementType.Specific)
            {
                var timeFormat = "yyyy-MM-dd HH:mm:ss";
                return date.ToString(timeFormat);
            }

            switch (filter.DateIncrementType)
            {
                case DateIncrementType.Hour:
                    return defaultTime.AddHours(filter.Increment).ToString();
                case DateIncrementType.Day:
                    return defaultTime.AddDays(filter.Increment).ToString();
                case DateIncrementType.Week:
                    return defaultTime.AddMonths(filter.Increment / 4).ToString();
                case DateIncrementType.Month:
                    return defaultTime.AddMonths(filter.Increment).ToString();
                case DateIncrementType.Year:
                    return defaultTime.AddYears(filter.Increment).ToString();
                default:
                    return defaultTime.ToString();
            }
        }

        static string ConstructNumericFilter(PanelItem pi)
        {
            var expr = "";
            var val1 = pi.NumericFilter.Filter[0];

            if (pi.NumericFilter.FilterType == NumericFilterType.Between)
            {
                var val2 = pi.NumericFilter.Filter[1];
                return $"value-quantity=ge{val1}&value-quantity=lt{val2}";
            }

            switch (pi.NumericFilter.FilterType)
            {
                case NumericFilterType.GreaterThan:
                    expr = "gt";
                    break;
                case NumericFilterType.GreaterThanOrEqualTo:
                    expr = "ge";
                    break;
                case NumericFilterType.LessThan:
                    expr = "lt";
                    break;
                case NumericFilterType.LessThanOrEqualTo:
                    expr = "le";
                    break;
                case NumericFilterType.EqualTo:
                    expr = "eq";
                    break;
                default:
                    return "";
            }

            return $"value-quantity={expr}{val1}";
        }

        async Task<PartialPatientCountContext> GetPartialContext(Panel panel)
        {
            var partialIds = new Dictionary<string, int>();
            var subpanel   = panel.SubPanels.First();
            var minCount   = subpanel.HasCountFilter ? subpanel.MinimumCount : 1;

            try
            {
                foreach (var pi in subpanel.PanelItems)
                {
                    var url = ConstructSearchUrl(pi, panel);

                    while (true)
                    {
                        var hasNext = false;
                        using (var request = new HttpRequestMessage { RequestUri = new Uri(url) })
                        {
                            var response = await client.SendAsync(request);
                            if (response.IsSuccessStatusCode)
                            {
                                var content = await response.Content.ReadAsStringAsync();
                                var jsonObj = JObject.Parse(content);
                                var dictObj = jsonObj.ToObject<Dictionary<string, object>>();
                                var entries = ((JArray)dictObj[Fields.Entry]).Cast<JObject>();

                                foreach (var entry in entries)
                                {
                                    var id = ParsePatientId(entry);
                                    if (id != null)
                                    {
                                        if (partialIds.ContainsKey(id)) partialIds[id]++;
                                        else partialIds.Add(id, 1);
                                    }
                                }

                                if (dictObj.ContainsKey(Fields.Link))
                                {
                                    var links = ((JArray)dictObj[Fields.Link]).Cast<JObject>();

                                    foreach (var link in links)
                                    {
                                        var relation = (string)link[Fields.Relation];
                                        if (relation == Fields.Next)
                                        {
                                            url = (string)link[Fields.Url];
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
                PatientIds = partialIds.Where(p => p.Value >= minCount).Select(p => p.Key).ToHashSet(),
                IsInclusionCriteria = panel.IncludePanel
            };
        }
    }

    static class Fields
    {
        public static string Entry = "entry";
        public static string Link = "link";
        public static string Relation = "relation";
        public static string Url = "url";
        public static string Next = "next";
        public static string Reference = "reference";
        public static string Id = "id";
        public static string Resource = "resource";
        public static string ResourceType = "resourceType";

        public static string Count = "_count";
        public static string Elements = "_elements";

        public static string Patient = "patient";
        public static string Person = "person";
        public static string Subject = "subject";
    }
}
