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
using System.Threading.Tasks;

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

        public async Task<AdminHelpPageContentSql> GetAsync(int id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var page = await cn.QueryFirstOrDefaultAsync<AdminHelpPageContentSql>(
                    Sql.Get,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return page;
            }
        }

        public async Task<AdminHelpPageCreateSql> CreateAsync(AdminHelpPageCreateSql p)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var created = await cn.QueryFirstOrDefaultAsync<AdminHelpPageCreateSql>(
                    Sql.Create,
                    new
                    {
                        title = p.Title,
                        category = p.Category,
                        orderId = p.OrderId,
                        type = p.Type,
                        textContent = p.TextContent,
                        imageContent = p.ImageContent,
                        imageId = p.ImageId,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return created;
            }
        }
        public async Task<AdminHelpPageContentSql> UpdateAsync(AdminHelpPageContentSql p)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminHelpPageContentSql>(
                    Sql.Update,
                    new
                    {
                        pageId = p.PageId,
                        title = p.Title,
                        category = p.Category,
                        orderId = p.OrderId,
                        type = p.Type,
                        textContent = p.TextContent,
                        imageContent = p.ImageContent,
                        imageId = p.ImageId,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return updated;
            }
        }
        public async Task<int?> DeleteAsync(int id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<int?>(
                    Sql.Delete,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return deleted;
            }
        }
    }
}
