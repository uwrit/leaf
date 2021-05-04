// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using Model.Options;
using Model.Authorization;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Dapper;
using Services.Tables;
using Model.Admin.Visualization;

namespace Services.Admin.Compiler
{
    public class AdminVisualizationPageService : AdminVisualizationPageManager.IAdminVisualizationPageService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminVisualizationPageService(IOptions<AppDbOptions> opts, IUserContext userContext)
        {
            this.opts = opts.Value;
            this.user = userContext;
        }

        public async Task<IEnumerable<AdminVisualizationPage>> GetVisualizationPagesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.GetPages,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return DbReader.ReadPages(grid);
            }
        }

        public async Task<AdminVisualizationPage> CreateVisualizationPageAsync(AdminVisualizationPage page)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                // Create page
                var grid = await cn.QueryMultipleAsync(
                    Sql.CreatePage,
                    new
                    {
                        name = page.PageName,
                        description = page.PageDescription,
                        orderid = page.OrderId,
                        constraints = ResourceConstraintTable.From(page),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                var created = DbReader.ReadPage(grid);

                // Create components
                var comps = new List<AdminVisualizationComponent>();
                foreach (var comp in page.Components)
                {
                    var compGrid = await cn.QueryMultipleAsync(
                        Sql.CreateComponent,
                        new
                        {
                            visualizationpageid = created.Id,
                            header = comp.Header,
                            subheader = comp.SubHeader,
                            jsonSpec = comp.JsonSpec,
                            isFullWidth = comp.IsFullWidth,
                            orderId = comp.OrderId,
                            datasets = ResourceIdTable.From(comp.DatasetQueryIds),
                            user = user.UUID

                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout);

                    comps.Add(DbReader.ReadComponent(compGrid));
                }

                created.Components = comps;
                return created;
            }
        }

        public async Task<AdminVisualizationPage> UpdateVisualizationPageAsync(AdminVisualizationPage page)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.UpdatePage,
                    new
                    {
                        id = page.Id,
                        name = page.PageName,
                        description = page.PageDescription,
                        orderid = page.OrderId,
                        constraints = ResourceConstraintTable.From(page),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                var updated = DbReader.ReadPage(grid);

                // Create components
                var comps = new List<AdminVisualizationComponent>();
                foreach (var comp in page.Components)
                {
                    var compGrid = await cn.QueryMultipleAsync(
                        Sql.CreateComponent,
                        new
                        {
                            visualizationpageid = updated.Id,
                            header = comp.Header,
                            subheader = comp.SubHeader,
                            jsonSpec = comp.JsonSpec,
                            isFullWidth = comp.IsFullWidth,
                            orderId = comp.OrderId,
                            datasets = ResourceIdTable.From(comp.DatasetQueryIds),
                            user = user.UUID

                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout);

                    comps.Add(DbReader.ReadComponent(compGrid));
                }

                updated.Components = comps;
                return updated;
            }
        }

        public async Task<Guid?> DeleteVisualizationPageAsync(Guid id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<Guid?>(
                    Sql.DeletePage,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return deleted;
            }
        }

        static class Sql
        {
            public const string GetPages = "adm.sp_GetVisualizationPages";
            public const string CreatePage = "adm.sp_CreateVisualizationPage";
            public const string CreateComponent = "adm.sp_CreateVisualizationComponent";
            public const string UpdatePage = "adm.sp_UpdateVisualizationPage";
            public const string DeletePage = "adm.sp_DeleteVisualizationPage";
        }

        class AdminVisualizationPageRecord
        {
            public Guid? Id { get; set; }
            public string PageName { get; set; }
            public string PageDescription { get; set; }
            public int OrderId { get; set; }
            public DateTime Created { get; set; }
            public string CreatedBy { get; set; }
            public DateTime Updated { get; set; }
            public string UpdatedBy { get; set; }
        }

        class AdminVisualizationComponentRecord
        {
            public Guid? Id { get; set; }
            public Guid? VisualizationPageId { get; set; }
            public string Header { get; set; }
            public string SubHeader { get; set; }
            public string JsonSpec { get; set; }
            public bool IsFullWidth { get; set; }
            public int OrderId { get; set; }
        }

        class AdminVisualizationComponentDatasetRefRecord
        {
            public Guid VisualizationPageId { get; set; }
            public Guid VisualizationComponentId { get; set; }
            public Guid DatasetQueryId { get; set; }
            public string DatasetName { get; set; }
        }

        class AdminVisualizationPageConstraintRecord
        {
            public Guid VisualizationPageId { get; set; }
            public int ConstraintId { get; set; }
            public string ConstraintValue { get; set; }

            public Model.Admin.Compiler.Constraint Constraint()
            {
                return new Model.Admin.Compiler.Constraint
                {
                    ResourceId = VisualizationPageId,
                    ConstraintId = Model.Admin.Compiler.Constraint.TypeFrom(ConstraintId),
                    ConstraintValue = ConstraintValue
                };
            }
        }

        static class DbReader
        {
            public static IEnumerable<AdminVisualizationPage> ReadPages(SqlMapper.GridReader grid)
            {
                var pageRecs = grid.Read<AdminVisualizationPageRecord>();
                var compRecs = grid.Read<AdminVisualizationComponentRecord>();
                var dsidRecs = grid.Read<AdminVisualizationComponentDatasetRefRecord>();
                var consRecs = grid.Read<AdminVisualizationPageConstraintRecord>();

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
                    (page, compsJoin) => new AdminVisualizationPage
                    {
                        Id = (Guid)page.Id,
                        PageName = page.PageName,
                        PageDescription = page.PageDescription,
                        OrderId = page.OrderId,
                        Constraints = consRecs.Where(con => con.VisualizationPageId == page.Id).Select(con => con.Constraint()),
                        Components = compsJoin.Select(comp => new AdminVisualizationComponent
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

            public static AdminVisualizationPage ReadPage(SqlMapper.GridReader grid)
            {
                var pageRec = grid.Read<AdminVisualizationPageRecord>().FirstOrDefault();
                var consRecs = grid.Read<AdminVisualizationPageConstraintRecord>();

                if (pageRec == null) return null;

                return new AdminVisualizationPage
                {
                    PageName = pageRec.PageName,
                    PageDescription = pageRec.PageDescription,
                    OrderId = pageRec.OrderId,
                    Constraints = consRecs.Select(c => c.Constraint())
                };
            }

            public static AdminVisualizationComponent ReadComponent(SqlMapper.GridReader grid)
            {
                var compRec = grid.Read<AdminVisualizationComponentRecord>().FirstOrDefault();
                var dsidRecs = grid.Read<AdminVisualizationComponentDatasetIdRecord>();

                if (compRec == null) return null;

                return new AdminVisualizationComponent
                {
                    Header = compRec.Header,
                    SubHeader = compRec.SubHeader,
                    JsonSpec = compRec.JsonSpec,
                    DatasetQueryRefs = dsidRecs.Select(id => id.DatasetQueryId),
                    IsFullWidth = compRec.IsFullWidth,
                    OrderId = compRec.OrderId
                };
            }
        }
    }
}