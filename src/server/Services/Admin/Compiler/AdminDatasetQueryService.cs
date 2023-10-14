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
using Model.Admin.Compiler;
using Model.Authorization;
using Model.Tagging;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Dapper;
using Model.Compiler;
using Services.Tables;
using Services.Search;

namespace Services.Admin.Compiler
{
    public class AdminDatasetQueryService : AdminDatasetQueryManager.IAdminDatasetQueryService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminDatasetQueryService(IOptions<AppDbOptions> opts, IUserContext user)
        {
            this.opts = opts.Value;
            this.user = user;
        }

        public async Task<AdminDatasetQuery> GetDatasetQueryByIdAsync(Guid id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.GetById,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return DbReader.Read(grid);
            }
        }

        public async Task<AdminDatasetQuery> UpdateDatasetQueryAsync(AdminDatasetQuery query)
        {
            if (query.Shape == Shape.Dynamic)
            {
                return await UpdateDynamicDatasetQueryAsync(query);
            }
            return await UpdateShapedDatasetQueryAsync(query);
        }

        async Task<AdminDatasetQuery> UpdateShapedDatasetQueryAsync(AdminDatasetQuery query)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.Update,
                    new
                    {
                        id = query.Id,
                        uid = query.UniversalId?.ToString(),
                        isdefault = query.IsDefault,
                        shape = query.Shape,
                        name = query.Name,
                        catid = query.CategoryId,
                        desc = query.Description,
                        sql = query.SqlStatement,
                        tags = DatasetQueryTagTable.From(query.Tags),
                        constraints = ResourceConstraintTable.From(query),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                var updated = DbReader.Read(grid);
                return updated;
            }
        }

        async Task<AdminDatasetQuery> UpdateDynamicDatasetQueryAsync(AdminDatasetQuery query)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.UpdateDynamic,
                    new
                    {
                        id = query.Id,
                        isdefault = query.IsDefault,
                        name = query.Name,
                        catid = query.CategoryId,
                        desc = query.Description,
                        sql = query.SqlStatement,
                        isEnc = query.IsEncounterBased,
                        schema = DynamicDatasetSchemaFieldSerde.Serialize(query.Schema),
                        sqlDate = query.SqlFieldDate,
                        sqlValString = query.SqlFieldValueString,
                        sqlValNum = query.SqlFieldValueNumeric,
                        tags = DatasetQueryTagTable.From(query.Tags),
                        constraints = ResourceConstraintTable.From(query),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                var updated = DbReader.Read(grid);
                return updated;
            }
        }

        public async Task<AdminDatasetQuery> CreateDatasetQueryAsync(AdminDatasetQuery query)
        {
            if (query.Shape == Shape.Dynamic)
            {
                return await CreateDynamicDatasetQueryAsync(query);
            }
            return await CreateShapedDatasetQueryAsync(query);
        }

        async Task<AdminDatasetQuery> CreateShapedDatasetQueryAsync(AdminDatasetQuery query)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.Create,
                    new
                    {
                        uid = query.UniversalId?.ToString(),
                        isdefault = query.IsDefault,
                        shape = query.Shape,
                        name = query.Name,
                        catid = query.CategoryId,
                        desc = query.Description,
                        sql = query.SqlStatement,
                        tags = DatasetQueryTagTable.From(query.Tags),
                        constraints = ResourceConstraintTable.From(query),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                var created = DbReader.Read(grid);
                return created;
            }
        }

        async Task<AdminDatasetQuery> CreateDynamicDatasetQueryAsync(AdminDatasetQuery query)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.CreateDynamic,
                    new
                    {
                        shape = query.Shape,
                        name = query.Name,
                        catid = query.CategoryId,
                        desc = query.Description,
                        sql = query.SqlStatement,
                        isEnc = query.IsEncounterBased,
                        isDefault = query.IsDefault,
                        schema = DynamicDatasetSchemaFieldSerde.Serialize(query.Schema),
                        sqlDate = query.SqlFieldDate,
                        sqlValString = query.SqlFieldValueString,
                        sqlValNum = query.SqlFieldValueNumeric,
                        tags = DatasetQueryTagTable.From(query.Tags),
                        constraints = ResourceConstraintTable.From(query),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                var created = DbReader.Read(grid);
                return created;
            }
        }

        public async Task<Guid?> DeleteDatasetQueryAsync(Guid id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<Guid?>(
                    Sql.Delete,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return deleted;
            }
        }

        static class Sql
        {
            public const string GetById = "adm.sp_GetDatasetQueryById";
            public const string Update = "adm.sp_UpdateDatasetQuery";
            public const string Create = "adm.sp_CreateDatasetQuery";
            public const string Delete = "adm.sp_DeleteDatasetQuery";
            public const string CreateDynamic = "adm.sp_CreateDynamicDatasetQuery";
            public const string UpdateDynamic = "adm.sp_UpdateDynamicDatasetQuery";
        }

        class DatasetQueryRecord
        {
            public Guid Id { get; set; }
            public string UniversalId { get; set; }
            public int Shape { get; set; }
            public string Name { get; set; }
            public int? CategoryId { get; set; }
            public string Description { get; set; }
            public string SqlStatement { get; set; }
            public bool IsEncounterBased { get; set; }
            public bool IsDefault { get; set; }
            public string SqlFieldDate { get; set; }
            public string SqlFieldValueString { get; set; }
            public string SqlFieldValueNumeric { get; set; }
            public string Schema { get; set; }
            public DateTime Created { get; set; }
            public string CreatedBy { get; set; }
            public DateTime Updated { get; set; }
            public string UpdatedBy { get; set; }
        }

        class DatasetQueryTag
        {
            public Guid DatasetQueryId { get; set; }
            public string Tag { get; set; }
        }

        class DatasetQueryConstraintRecord
        {
            public Guid DatasetQueryId { get; set; }
            public int ConstraintId { get; set; }
            public string ConstraintValue { get; set; }

            public Model.Admin.Compiler.Constraint Constraint()
            {
                return new Model.Admin.Compiler.Constraint
                {
                    ResourceId = DatasetQueryId,
                    ConstraintId = Model.Admin.Compiler.Constraint.TypeFrom(ConstraintId),
                    ConstraintValue = ConstraintValue
                };
            }
        }

        static class DbReader
        {
            public static AdminDatasetQuery Read(SqlMapper.GridReader grid)
            {
                var query = grid.ReadFirstOrDefault<DatasetQueryRecord>();
                if (query == null)
                {
                    return null;
                }
                var tags = grid.Read<DatasetQueryTag>();
                var cons = grid.Read<DatasetQueryConstraintRecord>();
                return new AdminDatasetQuery
                {
                    Id = query.Id,
                    UniversalId = DatasetQueryUrn.From(query.UniversalId),
                    IsDefault = query.IsDefault,
                    Shape = (Shape)query.Shape,
                    Name = query.Name,
                    CategoryId = query.CategoryId,
                    Description = query.Description,
                    IsEncounterBased = query.IsEncounterBased,
                    SqlStatement = query.SqlStatement,
                    SqlFieldDate = query.SqlFieldDate,
                    SqlFieldValueString = query.SqlFieldValueString,
                    SqlFieldValueNumeric = query.SqlFieldValueNumeric,
                    Schema = DynamicDatasetSchemaFieldSerde.Deserialize(query.Schema),
                    Created = query.Created,
                    CreatedBy = query.CreatedBy,
                    Updated = query.Updated,
                    UpdatedBy = query.UpdatedBy,
                    Tags = tags.Select(t => t.Tag),
                    Constraints = cons.Select(c => c.Constraint())
                };
            }
        }

        class DatasetQueryTagTable : ISqlTableType
        {
            public DataTable Value
            {
                get;
                private set;
            }

            public const string Type = @"app.DatasetQueryTagTable";
            const string tag = @"Tag";

            DatasetQueryTagTable(IEnumerable<string> tags)
            {
                var table = Schema();
                Fill(table, with: tags);
                Value = table;
            }

            DataTable Schema()
            {
                var dt = new DataTable();

                dt.Columns.Add(tag, typeof(string));

                dt.SetTypeName(Type);

                return dt;
            }

            void Fill(DataTable table, IEnumerable<string> with)
            {
                foreach (var t in with.Distinct(new TagEqualityComparer()))
                {
                    var row = table.NewRow();
                    row[tag] = t;
                    table.Rows.Add(row);
                }
            }

            public static DataTable From(IEnumerable<string> tags)
            {
                return new DatasetQueryTagTable(tags).Value;
            }
        }
    }
}