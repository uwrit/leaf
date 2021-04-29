// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Options;
using Model.Search;
using Model.Visualization;
using Services.Tables;

namespace Services.Search
{
    public class VisualizationPageFetcher : IVisualizationPageFetcher
    {
        readonly IUserContext user;
        readonly AppDbOptions opts;

        public VisualizationPageFetcher(
            IUserContext userContext,
            IOptions<AppDbOptions> dbOptions)
        {
            user = userContext;
            opts = dbOptions.Value;
        }

        public async Task<IEnumerable<IVisualizationPage>> GetVisualizationPagesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    SqlProcedures.getVisualizationPages,
                    new { user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                var pageRecs = grid.Read<VisualizationPageRecord>();
                var compRecs = grid.Read<VisualizationComponentRecord>();
                var dsidRecs = grid.Read<VisualizationComponentDatasetIdRecord>();

                var comps = compRecs.GroupJoin(dsidRecs,
                    comp => comp.Id,
                    dsid => dsid.VisualizationComponentId,
                    (comp, dsid) => new
                    {
                        comp.VisualizationPageId,
                        Component = comp,
                        DatasetQueryIds = dsid.Select(ds => ds.DatasetQueryId)
                    });

                var pages = pageRecs.GroupJoin(comps,
                    page => page.Id,
                    comp => comp.VisualizationPageId,
                    (page, compsJoin) => new VisualizationPage
                    {
                        PageName = page.PageName,
                        PageDescription = page.PageDescription,
                        OrderId = page.OrderId,
                        Components = compsJoin.Select(comp => new VisualizationComponent
                        {
                            Header = comp.Component.Header,
                            SubHeader = comp.Component.SubHeader,
                            JsonSpec = comp.Component.JsonSpec,
                            DatasetQueryIds = comp.DatasetQueryIds,
                            IsFullWidth = comp.Component.IsFullWidth,
                            OrderId = comp.Component.OrderId
                        })
                    });

                return pages;
            }
        }

        static class SqlProcedures
        {
            public const string getVisualizationPages = "app.sp_GetVisualizationPages";
        }
    }
}
