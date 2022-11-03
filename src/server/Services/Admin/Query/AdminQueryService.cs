// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Model.Options;
using Model.Compiler;
using Model.Admin.Query;
using Microsoft.Extensions.Options;
using System.Data.SqlClient;
using Dapper;
using System.Data;
using Model.Tagging;

namespace Services.Admin.Query
{
    public class AdminQueryService : AdminQueryManager.IAdminQueryService
    {
        readonly AppDbOptions opts;

        public AdminQueryService(IOptions<AppDbOptions> options)
        {
            opts = options.Value;
        }

        public async Task<IEnumerable<BaseQuery>> GetUserQueriesAsync(string userId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var records = await cn.QueryAsync<BaseQueryRecord>(
                        Sql.SavedQueriesByOwner,
                        new { user = userId },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );

                return records.Select(r => new BaseQuery
                {
                    Id = r.Id,
                    UniversalId = QueryUrn.From(r.UniversalId),
                    Name = r.Name,
                    Category = r.Category,
                    Owner = r.Owner,
                    Created = r.Created,
                    Updated = r.Updated,
                    Count = r.Count
                });
            }
        }

        static class Sql
        {
            public static string SavedQueriesByOwner = @"app.sp_GetSavedBaseQueriesByOwner";
        }

        class BaseQueryRecord
        {
            public Guid Id { get; set; }
            public string UniversalId { get; set; }
            public string Name { get; set; }
            public string Category { get; set; }
            public string Owner { get; set; }
            public DateTime Created { get; set; }
            public DateTime Updated { get; set; }
            public int? Count { get; set; }
        }

    }
}
