// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;
using Dapper;
using Model.Admin.Compiler;
using Model.Authorization;
using Model.Options;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using Services.Tables;

namespace Services.Admin.Compiler
{
    public class AdminHelpService : AdminHelpManager.IAdminHelpPageService
    {
        readonly IUserContext user;
        readonly AppDbOptions opts;

        static class Sql
        {
            public const string Get    = "adm.sp_GetHelpPageAndContent";
            public const string Create = "adm.sp_CreateHelpPageAndContent";
            public const string Update = "adm.sp_UpdateHelpPageAndContent";
            public const string Delete = "adm.sp_DeleteHelpPageAndContent";
        }

        public AdminHelpService(
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            opts = options.Value;
            user = userContext;
        }

        public async Task<AdminHelpPage> GetAsync(Guid id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.Get,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminHelpReader.Read(grid);
            }
        }

        public async Task<AdminHelpPage> CreateAsync(AdminHelpPage page)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.Create,
                    new { content = HelpPageTable.From(page) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminHelpReader.Read(grid);
            }
        }

        public async Task<AdminHelpPage> UpdateAsync(AdminHelpPage page)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.Update,
                    new { content = HelpPageTable.From(page) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminHelpReader.Read(grid);
            }
        }

        public async Task<Guid?> DeleteAsync(Guid id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<Guid?>(
                    Sql.Delete,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return deleted;
            }
        }
    }

    static class AdminHelpReader
    {
        public static AdminHelpPage Read(SqlMapper.GridReader grid)
        {
            // TODO: check if i can do ReadSingle for title
            var page = grid.ReadFirstOrDefault<HelpPageRecord>();
            if (page == null) { return null; }

            var category = grid.ReadSingle<AdminHelpPageCategory>();

            var content = grid.Read<AdminHelpPageContent>();

            return page.Content(category, content);
        }
    }

    class HelpPageRecord
    {
        public string Title { get; set; }

        public AdminHelpPage Content(AdminHelpPageCategory category = null, IEnumerable<AdminHelpPageContent> content = null)
        {
            return new AdminHelpPage
            {
                Title = Title,
                Category = category,
                Content = content ?? new List<AdminHelpPageContent>()
            };
        }
    }
}
