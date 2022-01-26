// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Dapper;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Compiler;
using Model.Options;
using Services.Tables;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Services.Help
{
    public class HelpPageService : HelpPageManager.IHelpPageService
    {
        const string getHelpPages = @"app.sp_GetHelpPages";
        const string getHelpPageCategories = @"app.sp_GetHelpPageCategories";
        const string getHelpPageContent = @"app.sp_GetHelpPageContent";

        readonly AppDbOptions opts;

        public HelpPageService(IOptions<AppDbOptions> dbOpts)
        {
            opts = dbOpts.Value;
        }

        public async Task<IEnumerable<HelpPage>> GetHelpPagesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var pages = await cn.QueryAsync<HelpPage>(
                    getHelpPages,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return pages.Select(p => new HelpPage
                {
                    Id = p.Id,
                    CategoryId = p.CategoryId,
                    Title = p.Title
                });
            }
        }

        public async Task<IEnumerable<HelpPageCategory>> GetHelpPageCategoriesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var cats = await cn.QueryAsync<HelpPageCategory>(
                    getHelpPageCategories,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return cats.Select(c => new HelpPageCategory
                {
                    Id = c.Id,
                    Name = c.Name
                });
            }
        }

        public async Task<IEnumerable<HelpPageContent>> GetHelpPageContentAsync(Guid pageId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var content = await cn.QueryAsync<HelpPageContent>(
                    getHelpPageContent,
                    new { pageId },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return content.Select(c => new HelpPageContent
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
    }
}