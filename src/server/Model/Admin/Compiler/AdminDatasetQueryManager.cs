// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Validation;
using Model.Compiler;
using Model.Error;
using System.Runtime.CompilerServices;

namespace Model.Admin.Compiler
{
    public class AdminDatasetQueryManager
    {
        public interface IAdminDatasetQueryService
        {
            Task<AdminDatasetQuery> GetDatasetQueryByIdAsync(Guid id);
            Task<AdminDatasetQuery> UpdateDatasetQueryAsync(AdminDatasetQuery query);
            Task<AdminDatasetQuery> CreateDatasetQueryAsync(AdminDatasetQuery query);
            Task<DatasetQueryDeleteResult> DeleteDatasetQueryAsync(Guid id);
        }

        readonly IAdminDatasetQueryService svc;
        readonly ILogger<AdminDatasetQueryManager> log;

        public AdminDatasetQueryManager(
            IAdminDatasetQueryService service,
            ILogger<AdminDatasetQueryManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<AdminDatasetQuery> GetDatasetQueryAsync(Guid id)
        {
            log.LogInformation("Getting DatasetQuery. Id:{Id}", id);
            return await svc.GetDatasetQueryByIdAsync(id);
        }

        public async Task<AdminDatasetQuery> UpdateDatasetQueryAsync(AdminDatasetQuery query)
        {
            ThrowIfInvalid(query);

            try
            {
                var updated = await svc.UpdateDatasetQueryAsync(query);
                log.LogInformation("Updated DatasetQuery. DatasetQuery:{@DatasetQuery}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update DatasetQuery. Query:{@Query} Code:{Code} Error:{Error}", query, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<AdminDatasetQuery> CreateDatasetQueryAsync(AdminDatasetQuery query)
        {
            ThrowIfInvalid(query);

            try
            {
                var created = await svc.CreateDatasetQueryAsync(query);
                log.LogInformation("Created DatasetQuery. DatasetQuery:{@DatasetQuery}", created);
                return created;
            }
            catch (DbException db)
            {
                log.LogError("Failed to create DatasetQuery. Query:{@Query} Code:{Code} Error:{Error}", query, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<DatasetQueryDeleteResult> DeleteDatasetQueryAsync(Guid id)
        {
            Ensure.NotDefault(id, nameof(id));

            var result = await svc.DeleteDatasetQueryAsync(id);
            if (result.Ok)
            {
                log.LogInformation("Deleted DatasetQuery. Id:{Id}", id);
            }
            else
            {
                log.LogInformation("Could not delete DatasetQuery due to conflicts. Id:{Id}", id);
            }
            return result;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(AdminDatasetQuery query)
        {
            Ensure.NotNull(query, nameof(query));
            Ensure.Defined<Shape>(query.Shape, nameof(query.Shape));
            Ensure.NotNullOrWhitespace(query.Name, nameof(query.Name));
            Ensure.NotNullOrWhitespace(query.SqlStatement, nameof(query.SqlStatement));
        }
    }
}
