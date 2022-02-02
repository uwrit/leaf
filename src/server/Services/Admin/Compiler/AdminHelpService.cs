// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;
using System.Linq;
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
            public const string GetHelpPages    = "adm.sp_GetHelpPages";
            public const string GetHelpPageCategories = "adm.sp_GetHelpPageCategories";
            public const string GetHelpPageContent = "adm.sp_GetHelpPageContent";
            public const string Create = "adm.sp_CreateHelpPage";
            public const string Update = "adm.sp_UpdateHelpPage";
            public const string Delete = "adm.sp_DeleteHelpPage";
        }

        public AdminHelpService(
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            opts = options.Value;
            user = userContext;
        }

        public async Task<IEnumerable<PartialAdminHelpPage>> GetHelpPagesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var pages = await cn.QueryAsync<PartialAdminHelpPage>(
                    Sql.GetHelpPages,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return pages.Select(p => new PartialAdminHelpPage
                {
                    Id = p.Id,
                    CategoryId = p.CategoryId,
                    Title = p.Title
                });
            }
        }

        public async Task<IEnumerable<AdminHelpPageCategory>> GetHelpPageCategoriesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var cats = await cn.QueryAsync<AdminHelpPageCategory>(
                    Sql.GetHelpPageCategories,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return cats.Select(c => new AdminHelpPageCategory
                {
                    Id = c.Id,
                    Name = c.Name
                });
            }
        }

        public async Task<IEnumerable<AdminHelpPageContent>> GetHelpPageContentAsync(Guid pageId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var content = await cn.QueryAsync<AdminHelpPageContent>(
                    Sql.GetHelpPageContent,
                    new { pageId },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return content.Select(c => new AdminHelpPageContent
                {
                    Id = c.Id,
                    OrderId = c.OrderId,
                    Type = c.Type,
                    TextContent = c.TextContent,
                    ImageId = c.ImageId,
                    ImageContent = c.ImageContent,
                    ImageSize = c.ImageSize
                });
            }
        }

        public async Task<AdminHelpPage> CreateAsync(AdminHelpPage p)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.Create,
                    new { content = HelpPageTable.From(p) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminHelpReader.Read(grid);
            }
        }

        public async Task<AdminHelpPage> UpdateAsync(AdminHelpPage p)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.Update,
                    new { content = HelpPageTable.From(p) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminHelpReader.Read(grid);
            }
        }

        public async Task<AdminHelpPage> DeleteAsync(Guid pageId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.Delete,
                    new { pageId },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminHelpReader.Read(grid);
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
        public Guid Id { get; set; }
        public string Title { get; set; }

        public AdminHelpPage Content(AdminHelpPageCategory category = null, IEnumerable<AdminHelpPageContent> content = null)
        {
            return new AdminHelpPage
            {
                Id = Id,
                Title = Title,
                Category = category,
                Content = content ?? new List<AdminHelpPageContent>()
            };
        }
    }
}
