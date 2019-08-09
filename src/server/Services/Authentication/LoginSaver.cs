// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Authentication;
using Model.Options;
using Dapper;
using System.Threading.Tasks;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Services.Authentication
{
    public class LoginSaver : ILoginSaver
    {
        readonly AppDbOptions opts;

        public LoginSaver(IOptions<AppDbOptions> options)
        {
            opts = options.Value;
        }

        public async Task SaveLogin(LoginEvent e)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                await cn.ExecuteAsync(
                    Sql.Upsert,
                    new
                    {
                        scopedId = e.ScopedIdentity,
                        fullId = e.FullIdentity,
                        claims = JsonConvert.SerializeObject(e.Claims)
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
            }
        }

        static class Sql
        {
            public const string Upsert = @"auth.sp_UpsertLogin";
        }
    }
}
