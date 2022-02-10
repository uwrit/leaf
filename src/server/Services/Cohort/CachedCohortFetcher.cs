// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Cohort;
using Model.Options;
using Dapper;
using System.Data;
using Services.Tables;
using System.Collections.Generic;

namespace Services.Cohort
{
    public class CachedCohortFetcher : ICachedCohortFetcher
    {
        const string queryGetCohort = "app.sp_GetCohortById";
        const string queryGetPatientbyCohort = "app.sp_GetPatientInCohortById";

        readonly AppDbOptions dbOptions;
        readonly IUserContext user;

        public CachedCohortFetcher(IOptions<AppDbOptions> dbOptions, IUserContext user)
        {
            this.dbOptions = dbOptions.Value;
            this.user = user;
        }

        public async Task<IEnumerable<CachedCohortRecord>> FetchCohortAsync(Guid queryId, bool exportedOnly)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                var cohort = await cn.QueryAsync<CachedCohortRecord>(
                    queryGetCohort,
                    new {
                        id = queryId,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        exportedOnly,
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                return cohort;
            }
        }

        public async Task<CachedCohortRecord> FetchPatientByCohortAsync(Guid queryid, string personid)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                var patient = await cn.QueryFirstAsync<CachedCohortRecord>(
                    queryGetPatientbyCohort,
                    new {
                        queryid,
                        personid,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                return patient;
            }
        }
    }
}
