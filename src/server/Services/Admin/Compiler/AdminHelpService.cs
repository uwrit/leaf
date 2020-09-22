// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using System.Data.SqlClient;
using Dapper;
using Model.Admin.Compiler;
using Model.Authorization;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Services.Admin.Compiler
{
    public class AdminHelpService : AdminHelpManager.IAdminHelpPageService
    {
        readonly IUserContext user;
        readonly AppDbOptions opts;

        static class Sql
        {
            public const string Get = "adm.sp_GetHelpPageAndContent";
            public const string Update = "adm.sp_UpdateHelpPageAndContent";
            public const string Create = "adm.sp_CreateHelpPage";
            public const string Delete = "adm.sp_DeleteHelpPageAndContent";
        }

        public AdminHelpService(
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            opts = options.Value;
            user = userContext;
        }

        public async Task<AdminHelp> GetAsync(int id)
        {
            // TODO(mh2727)
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var page = await cn.QuerySingleAsync(
                    Sql.Get,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return page;
            }
        }

        public async Task<AdminHelp> CreateAsync(int id)
        {
            // TODO(mh2727) 
        }
        public async Task<AdminHelp> UpdateAsync(int id)
        {
            // TODO(mh2727) 
        }
        public async Task<AdminHelp> DeleteAsync(int id)
        {
            // TODO(mh2727) 
        }
    }
}
