// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Threading.Tasks;
using Services.Extensions;
using Model.Cohort;
using Services.Cohort;
using Services.Authorization;

namespace Services.Cohort
{
    public class CohortCacheService : ICohortCacheService
    {
        const string queryCreateUnsaved = "app.sp_CreateCachedUnsavedQuery";
        const string queryDeleteUnsavedNonce = "app.sp_DeleteCachedUnsavedQuery";

        readonly AppDbOptions dbOptions;
        readonly CohortOptions cohortOptions;
        readonly ILogger<CohortCacheService> log;

        public CohortCacheService(
            IOptions<AppDbOptions> appDbOptions,
            IOptions<CohortOptions> cohortOptions,
            ILogger<CohortCacheService> logger
        )
        {
            dbOptions = appDbOptions.Value;
            this.cohortOptions = cohortOptions.Value;
            log = logger;
        }

        public async Task<Guid> CreateUnsavedQueryAsync(PatientCohort cohort, IUserContext user)
        {
            var nonce = NonceOrThrowIfNull(user);
            log.LogInformation("Creating Unsaved Cohort.");
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                var queryId = await cn.ExecuteScalarAsync<Guid>(
                    queryCreateUnsaved,
                    new { user = user.UUID, nonce },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                if (cohort.Count <= cohortOptions.RowLimit)
                {

                    var cohortTable = new PatientCohortTable(queryId, cohort, cohortOptions.ExportLimit);

                    using (var bc = new SqlBulkCopy(cn))
                    {
                        bc.DestinationTableName = PatientCohortTable.Table;

                        await bc.WriteToServerAsync(cohortTable.Rows);
                    }
                }

                return queryId;
            }
        }

        public async Task DeleteUnsavedCohortAsync(IUserContext user)
        {
            var nonce = NonceOrThrowIfNull(user);

            log.LogInformation("Deleting Unsaved Cohort");
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
            if (nonce == null)
            {
                throw new ArgumentNullException(nameof(user));
            }
            return (Guid)nonce;
        }
    }
}
