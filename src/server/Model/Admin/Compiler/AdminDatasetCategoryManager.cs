// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Validation;
using Model.Compiler;
using Model.Error;
using System.Runtime.CompilerServices;

namespace Model.Admin.Compiler
{
    public class AdminDatasetCategoryManager
    {
        public interface IAdminDatasetCategoryService
        {
            Task<DatasetQueryCategory> CreateCategoryAsync(DatasetQueryCategory cat);
            Task<IEnumerable<DatasetQueryCategory>> GetCategoriesAsync();
            Task<DatasetQueryCategory> UpdateCategoryAsync(DatasetQueryCategory cat);
            Task<DatasetQueryCategoryDeleteResult> DeleteCategoryAsync(int id);
        }

        readonly IAdminDatasetCategoryService svc;
        readonly ILogger<AdminDatasetCategoryManager> log;

        public AdminDatasetCategoryManager(
            IAdminDatasetCategoryService service,
            ILogger<AdminDatasetCategoryManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<DatasetQueryCategory> CreateCategoryAsync(DatasetQueryCategory cat)
        {
            ThrowIfInvalid(cat);

            try
            {
                var created = await svc.CreateCategoryAsync(cat);
                log.LogInformation("Created DatasetQueryCategory. DatasetQueryCategory:{@DatasetQueryCategory}", created);
                return created;
            }
            catch (DbException db)
            {
                log.LogError("Failed to create DatasetQueryCategory. DatasetQueryCategory:{@DatasetQueryCategory} Code:{Code} Error:{Error}", cat, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<DatasetQueryCategory>> GetCategoriesAsync()
        {
            log.LogInformation("Getting DatasetQueryCategories.");
            return await svc.GetCategoriesAsync();
        }

        public async Task<DatasetQueryCategory> UpdateCategoryAsync(DatasetQueryCategory cat)
        {
            ThrowIfInvalid(cat);

            try
            {
                var updated = await svc.UpdateCategoryAsync(cat);
                log.LogInformation("Updated DatasetQueryCategory. DatasetQueryCategory:{@DatasetQueryCategory}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update DatasetQueryCategory. DatasetQueryCategory:{@DatasetQueryCategory} Code:{Code} Error:{Error}", cat, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<DatasetQueryCategoryDeleteResult> DeleteCategoryAsync(int id)
        {
            try
            {
                var result = await svc.DeleteCategoryAsync(id);
                if (result.Ok)
                {
                    log.LogInformation("Deleted DatasetQueryCategory. Id:{Id}", id);
                }
                else
                {
                    log.LogInformation("Could not delete DatasetQueryCategory due to conflicts. Id:{Id}", id);
                }
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete DatasetQueryCategory. Id:{Id} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(DatasetQueryCategory cat)
        {
            Ensure.NotNull(cat, nameof(cat));
            Ensure.NotNullOrWhitespace(cat.Category, nameof(cat.Category));
        }
    }
}
