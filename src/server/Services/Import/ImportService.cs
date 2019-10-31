// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Import;
using Model.Options;
using Model.Authorization;
using Dapper;
using Services.Tables;

namespace Services.Import
{
    public class ImportService : DataImporter.IImportService
    {
        readonly AppDbOptions dbOptions;
        readonly IUserContext user;
        readonly ILogger<ImportService> logger;
        readonly JsonSerializerSettings serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public ImportService(
            IOptions<AppDbOptions> dbOptions, 
            ILogger<ImportService> logger,
            IUserContext user
        )
        {
            this.dbOptions = dbOptions.Value;
            this.logger = logger;
            this.user = user;
        }

        public async Task<IEnumerable<ImportMetadata>> GetAllImportMetadataAsync()
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.GetAllMetadata,
                    new { user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                var metas = DbReader.ReadMany(grid);
                return metas;
            }
        }


        public async Task<ImportMetadata> GetImportMetadataAsync(string sourceId)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.GetMetadataBySourceId,
                    new
                    {
                        sourceId,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                var metadata = DbReader.Read(grid);
                return metadata;
            }
        }

        public async Task<ImportMetadata> GetImportMetadataAsync(Guid id)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.GetMetadataById,
                    new
                    {
                        id,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                var metadata = DbReader.Read(grid);
                return metadata;
            }
        }

        public async Task<ImportMetadata> CreateImportMetadataAsync(ImportMetadata metadata)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.CreateImportMetadata,
                    new
                    {
                        sourceId = metadata.SourceId,
                        type = metadata.Type,
                        structure = metadata.StructureJson,
                        constraints = ResourceConstraintTable.From(metadata),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                var created = DbReader.Read(grid);
                return created;
            }
        }

        public async Task<ImportMetadata> UpdateImportMetadataAsync(ImportMetadata metadata)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.UpdateImportMetadata,
                    new
                    {
                        id = metadata.Id,
                        sourceId = metadata.SourceId,
                        type = metadata.Type,
                        structure = metadata.StructureJson,
                        constraints = ResourceConstraintTable.From(metadata),
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                var updated = DbReader.Read(grid);
                return updated;
            }
        }

        public async Task<ImportMetadata> DeleteImportMetadataAsync(Guid id)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var grid = await cn.QueryMultipleAsync(
                    Sql.DeleteImportMetadata,
                    new
                    {
                        id,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: 180
                );

                var deleted = DbReader.Read(grid);
                return deleted;
            }
        }

        public async Task<DataImporter.IImportDataResult> ImportDataAsync(Guid id, IEnumerable<ImportRecord> records)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var changed = await cn.QueryFirstOrDefaultAsync<Result>(
                    Sql.ImportData,
                    new
                    {
                        id,
                        data = ImportDataTable.From(id, records),
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );
                return changed;
            }
        }

        public async Task<IEnumerable<ImportRecord>> GetImportDataAsync(Guid id)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var changed = await cn.QueryAsync<ImportRecord>(
                    Sql.GetImportData,
                    new
                    {
                        id,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );
                return changed;
            }
        }

        public class Result : DataImporter.IImportDataResult
        {
            public int Changed { get; set; }
            public IEnumerable<string> Unmapped { get; set; }
        }

        public class ImportMetadataRecord
        {
            public Guid Id { get; set; }
            public string SourceId { get; set; }
            public ImportType Type { get; set; }
            public string Structure { get; set; }
            public DateTime Created { get; set; }
            public DateTime Updated { get; set; }
        }

        static class DbReader
        {
            public static ImportMetadata Read(SqlMapper.GridReader grid)
            {
                var meta = grid.ReadFirstOrDefault<ImportMetadataRecord>();
                if (meta == null)
                {
                    return null;
                }
                var cons = grid.Read<ImportMetadataConstraintRecord>();
                return new ImportMetadata
                {
                    Constraints = cons.Select(c => c.Constraint()),
                    Created = meta.Created,
                    Id = meta.Id,
                    SourceId = meta.SourceId,
                    StructureJson = meta.Structure,
                    Type = meta.Type,
                    Updated = meta.Updated
                };
            }

            public static IEnumerable<ImportMetadata> ReadMany(SqlMapper.GridReader grid)
            {
                var metas = grid.Read<ImportMetadataRecord>();
                var cons = grid.Read<ImportMetadataConstraintRecord>();

                return metas.Select(m =>
                new ImportMetadata
                {
                    Constraints = cons.Where(c => c.ImportMetadataId == m.Id).Select(c => c.Constraint()),
                    Created = m.Created,
                    Id = m.Id,
                    SourceId = m.SourceId,
                    StructureJson = m.Structure,
                    Type = m.Type,
                    Updated = m.Updated
                });
            }
        }

        class ImportMetadataConstraintRecord
        {
            public Guid ImportMetadataId { get; set; }
            public int ConstraintId { get; set; }
            public string ConstraintValue { get; set; }

            public Model.Admin.Compiler.Constraint Constraint()
            {
                return new Model.Admin.Compiler.Constraint
                {
                    ResourceId = ImportMetadataId,
                    ConstraintId = Model.Admin.Compiler.Constraint.TypeFrom(ConstraintId),
                    ConstraintValue = ConstraintValue
                };
            }
        }

        static class Sql
        {
            public const string GetAllMetadata = "app.sp_GetImportMetadata";
            public const string GetMetadataBySourceId = "app.sp_GetImportMetadataBySourceId";
            public const string GetMetadataById = "app.sp_GetImportMetadataById";
            public const string CreateImportMetadata = "app.sp_CreateImportMetadata";
            public const string UpdateImportMetadata = "app.sp_UpdateImportMetadata";
            public const string DeleteImportMetadata = "app.sp_DeleteImportMetadata";
            public const string ImportData = "app.sp_ImportData";
            public const string GetImportData = "app.sp_GetImportData";
        }
    }
}