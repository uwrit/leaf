// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Model.Help;
using Model.Authorization;
using Model.Compiler;
using Model.Options;
using System;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;
using Dapper;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Services.Tables;
using System.Linq;

namespace Services.Help
{
    public class HelpPageService : HelpPage.IHelpPage
    {
        const string getAllHelpPages = @"app.sp_GetHelpPages";
        const string getHelpPageCategories = @"app.sp_GetHelpCategories";
        const string getPageContentById = @"app.sp_GetHelpPageContentByPageId";

        readonly AppDbOptions opts;

        public HelpPageService(IOptions<AppDbOptions> dbOpts)
        {
            opts = dbOpts.Value;
        }

        public async Task<IEnumerable<HelpPageSql>> GetAllPagesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var pages = await cn.QueryAsync<HelpPageSql>(
                    getAllHelpPages,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return pages.Select(p => new HelpPageSql
                {
                    Id = p.Id,
                    CategoryId = p.CategoryId,
                    Title = p.Title
                });
            }
        }

        public async Task<IEnumerable<HelpPageCategorySql>> GetHelpPageCategoriesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var cat = await cn.QueryAsync<HelpPageCategorySql>(
                    getHelpPageCategories,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return cat.Select(c => new HelpPageCategorySql
                {
                    Id = c.Id,
                    Category = c.Category
                });
            }
        }

        public async Task<IEnumerable<HelpPageContentSql>> GetPageContentAsync(Guid pageid)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var content = await cn.QueryAsync<HelpPageContentSql>(
                    getPageContentById,
                    new { pageid },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return content.Select(c => new HelpPageContentSql
                {
                    Id = c.Id,
                    PageId = c.PageId,
                    OrderId = c.OrderId,
                    Type = c.Type,
                    TextContent = c.TextContent,
                    ImageContent = c.ImageContent,
                    ImageId = c.ImageId
                });
            }
        }
    }
}
