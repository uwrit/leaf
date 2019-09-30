// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
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
    public class ImportService : IImportService
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

        public async Task<IEnumerable<ImportMetadata>> GetAllImportMetadata()
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var metadata = await cn.QueryAsync<ImportMetadata>(
                    Sql.GetAllMetadata,
                    new { user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );
                return metadata;
            }
        }


        public async Task<ImportMetadata> GetImportMetadataAsync(string sourceId)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                var metadata = await cn.QueryFirstOrDefaultAsync<ImportMetadata>(
                    Sql.GetMetadataBySourceId,
                    new 
                    { 
                        sourceId = sourceId,
                        user = user.UUID, 
                        groups = GroupMembership.From(user), 
                        admin = user.IsAdmin 
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );
                return metadata;
            }
        }

        public async Task<ImportMetadata> GetImportMetadataAsync(Guid id)
        {

        }

        public async Task<ImportMetadata> CreateImportMetadataAsync(IImportMetadata metadata)
        {

        }

        public async Task<ImportMetadata> UpdateImportMetadataAsync(IImportMetadata metadata)
        {

        }

        public async Task<ImportMetadata> DeleteImportMetadataAsync(Guid id)
        {

        }

        public async Task<IImportService.IResult> AddImportDataAsync(IEnumerable<IImport> records)
        {

        }

        public async Task<IEnumerable<IImport>> GetImportDataAsync(Guid id)
        {

        }

        public class Result : IImportService.IResult
        {
            public int RecordsChanged { get; set; }
        }
        static class Sql
        {
            public const string GetAllMetadata = "app.sp_GetImportMetadata";
            public const string GetMetadataBySourceId = "sp_GetImportMetadataBySourceId";
        }
    }
}