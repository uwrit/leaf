// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;
using Dapper;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Model.Cohort;
using Model.Compiler;
using Model.Authorization;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Services.Cohort
{
    public class CohortCacheService : CohortCounter.ICohortCacheService
    {
        const string queryCreateUnsaved = "app.sp_CreateCachedUnsavedQuery";
        const string queryDeleteUnsavedNonce = "app.sp_DeleteCachedUnsavedQuery";

        readonly AppDbOptions dbOptions;
        readonly CohortOptions cohortOptions;
        readonly DeidentificationOptions deidentOptions;
        readonly ILogger<PatientCohortService> logger;

        public CohortCacheService(
            IOptions<AppDbOptions> appDbOptions,
            IOptions<CohortOptions> cohortOptions,
            IOptions<DeidentificationOptions> deidentOptions,
            ILogger<PatientCohortService> logger
        )
        {
            dbOptions = appDbOptions.Value;
            this.cohortOptions = cohortOptions.Value;
            this.deidentOptions = deidentOptions.Value;
            this.logger = logger;
        }

        public async Task<CohortCounter.CacheCohortResult> CreateUnsavedQueryAsync(PatientCohort cohort, IUserContext user)
        {
            var nonce = NonceOrThrowIfNull(user);
            var rowCount = 0;
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                var queryId = await cn.ExecuteScalarAsync<Guid>(
                    queryCreateUnsaved,
                    new { user = user.UUID, nonce, definition = SerializePanels(cohort.Panels) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                if (cohort.Any() && cohort.Count <= cohortOptions.RowLimit)
                {
                    int exportLimit = cohortOptions.ExportLimit;
                    var lowcell = deidentOptions.Cohort.LowCellSizeMasking;

                    if (lowcell.Enabled)
                    {
                        if (cohort.Count <= lowcell.Threshold)
                        {
                            exportLimit = 0;
                        }
                    }

                    var cohortTable = new PatientCohortTable(queryId, cohort.SeasonedPatients(exportLimit, queryId));
                    rowCount = cohortTable.Rows.Count();

                    using (var bc = new SqlBulkCopy(cn))
                    {
                        bc.DestinationTableName = PatientCohortTable.Table;

                        await bc.WriteToServerAsync(cohortTable.Rows);
                    }
                }

                return new CohortCounter.CacheCohortResult()
                {
                    QueryId = queryId,
                    Cached = rowCount > 0
                };
            }
        }

        public async Task DeleteUnsavedCohortAsync(IUserContext user)
        {
            var nonce = NonceOrThrowIfNull(user);

            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                await cn.ExecuteAsync(
                    queryDeleteUnsavedNonce,
                    new { user = user.UUID, nonce },
                    commandTimeout: dbOptions.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );
            }
        }

        Guid NonceOrThrowIfNull(IUserContext user)
        {
            var nonce = user?.SessionNonce;
            if (!nonce.HasValue)
            {
                throw new ArgumentNullException(nameof(nonce));
            }
            return nonce.Value;
        }

        string SerializePanels(IEnumerable<Panel> panels)
        {
            return JsonConvert.SerializeObject(panels.ToArray(), new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                TypeNameHandling = TypeNameHandling.Auto,
            });
        }
    }
}
