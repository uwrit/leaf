// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Validation;
using Model.Error;
using System.Runtime.CompilerServices;
using System.Collections.Generic;

namespace Model.Admin.Visualization
{
    public class AdminVisualizationCategoryManager
    {
        public interface IAdminVisualizationCategoryService
        {
            Task<IEnumerable<AdminVisualizationCategory>> GetVisualizationCategoriesAsync();
            Task<AdminVisualizationCategory> CreateVisualizationCategoryAsync(AdminVisualizationCategory query);
            Task<AdminVisualizationCategory> UpdateVisualizationCategoryAsync(AdminVisualizationCategory query);
            Task<VisualizationCategoryDeleteResult> DeleteVisualizationCategoryAsync(Guid id);
        }

        readonly IAdminVisualizationCategoryService svc;
        readonly ILogger<AdminVisualizationCategoryManager> log;

        public AdminVisualizationCategoryManager(
            IAdminVisualizationCategoryService service,
            ILogger<AdminVisualizationCategoryManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<IEnumerable<AdminVisualizationCategory>> GetVisualizationCategoriesAsync()
        {
            try
            {
                var Categorys = await svc.GetVisualizationCategoriesAsync();
                log.LogInformation("Fetched VisualizationCategories");
                return Categorys;
            }
            catch (DbException db)
            {
                log.LogError("Failed to create VisualizationCategory. VisualizationCategory:{@VisualizationCategory} Code:{Code} Error:{Error}", db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<AdminVisualizationCategory> CreateVisualizationCategoryAsync(AdminVisualizationCategory Category)
        {
            ThrowIfInvalid(Category);

            try
            {
                var created = await svc.CreateVisualizationCategoryAsync(Category);
                log.LogInformation("Created VisualizationCategory. VisualizationCategory:{@VisualizationCategory}", created);
                return created;
            }
            catch (DbException db)
            {
                log.LogError("Failed to create VisualizationCategory. VisualizationCategory:{@VisualizationCategory} Code:{Code} Error:{Error}", Category, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<AdminVisualizationCategory> UpdateVisualizationCategoryAsync(AdminVisualizationCategory Category)
        {
            ThrowIfInvalid(Category);

            try
            {
                var updated = await svc.UpdateVisualizationCategoryAsync(Category);
                log.LogInformation("Updated VisualizationCategory. VisualizationCategory:{@VisualizationCategory}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update VisualizationCategory. VisualizationCategory:{@VisualizationCategory} Code:{Code} Error:{Error}", Category, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<VisualizationCategoryDeleteResult> DeleteVisualizationCategoryAsync(Guid id)
        {
            try
            {
                var result = await svc.DeleteVisualizationCategoryAsync(id);
                if (result.Ok)
                {
                    log.LogInformation("Deleted VisualizationCategory. Id:{Id}", id);
                }
                else
                {
                    log.LogInformation("Could not delete VisualizationCategory due to conflicts. Id:{Id}", id);
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
        void ThrowIfInvalid(AdminVisualizationCategory Category)
        {
            Ensure.NotNull(Category, nameof(Category));
            Ensure.NotNullOrWhitespace(Category.Category, nameof(Category.Category));
        }
    }
}
