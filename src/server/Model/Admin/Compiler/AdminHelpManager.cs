// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.Logging;
using Model.Error;
using Model.Validation;

namespace Model.Admin.Compiler
{
    public class AdminHelpManager
    {
        public interface IAdminHelpPageService
        {
            Task<IEnumerable<PartialAdminHelpPage>> GetHelpPagesAsync();
            Task<IEnumerable<AdminHelpPageCategory>> GetHelpPageCategoriesAsync();
            Task<IEnumerable<AdminHelpPageContent>> GetHelpPageContentAsync(Guid pageId);
            Task<AdminHelpPage> CreateAsync(AdminHelpPage p);
            Task<AdminHelpPage> UpdateAsync(AdminHelpPage p);
            Task<AdminHelpPageCategory> UpdateCategoryAsync(Guid categoryId, AdminHelpPageCategory c);
            Task<AdminHelpPage> DeleteAsync(Guid pageId);
        }

        readonly ILogger<AdminHelpManager> log;
        readonly IAdminHelpPageService svc;

        public AdminHelpManager(
            ILogger<AdminHelpManager> log,
            IAdminHelpPageService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        public async Task<IEnumerable<PartialAdminHelpPage>> GetHelpPagesAsync()
        {
            log.LogInformation("Getting help pages.");
            try
            {
                return await svc.GetHelpPagesAsync();
            }
            catch (DbException de)
            {
                log.LogError("Failed to get help pages. Code:{Code} Error:{Error}", de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<AdminHelpPageCategory>> GetHelpPageCategoriesAsync()
        {
            log.LogInformation("Getting help page categories.");
            try
            {
                return await svc.GetHelpPageCategoriesAsync();
            }
            catch (DbException de)
            {
                log.LogError("Failed to get help page categories. Code:{Code} Error:{Error}", de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<AdminHelpPageContent>> GetHelpPageContentAsync(Guid pageId)
        {
            Ensure.NotNullOrWhitespace(pageId.ToString(), nameof(pageId));
            log.LogInformation("Getting help page content. PageId:{PageId}", pageId);
            try
            {
                return await svc.GetHelpPageContentAsync(pageId);
            }
            catch (DbException de)
            {
                log.LogError("Failed to get help page content. Code:{Code} Error:{Error}", de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<AdminHelpPage> CreateAsync(AdminHelpPage p)
        {
            ThrowIfInvalid(p);
            try
            {
                var created = await svc.CreateAsync(p);
                log.LogInformation("Created help page. Page:{@Page}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create help page. Page:{@Page} Code:{Code} Error:{Error}", p, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<AdminHelpPage> UpdateAsync(AdminHelpPage p)
        {
            ThrowIfInvalid(p);
            try
            {
                var updated = await svc.UpdateAsync(p);
                log.LogInformation("Updated help page. Page:{@Page}", updated);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update help page. Page:{@Page} Code:{Code} Error:{Error}", p, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<AdminHelpPageCategory> UpdateCategoryAsync(Guid categoryId, AdminHelpPageCategory c)
        {
            Ensure.NotNullOrWhitespace(categoryId.ToString(), nameof(categoryId));
            ThrowIfCategoryInvalid(c);
            try
            {
                var updated = await svc.UpdateCategoryAsync(categoryId, c);
                log.LogInformation("Updated help page category. Category:{@Category}", updated);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update help page category. Category:{@Category} Code:{Code} Error:{Error}", c, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<AdminHelpPage> DeleteAsync(Guid pageId)
        {
            Ensure.NotNullOrWhitespace(pageId.ToString(), nameof(pageId));
            try
            {
                var deleted = await svc.DeleteAsync(pageId);
                log.LogInformation("Deleted help page. Page:{Page}", deleted);
                return deleted;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete help page. PageId:{@PageId} Code:{Code} Error:{Error}", pageId, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
            
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfCategoryInvalid(AdminHelpPageCategory c)
        {
            Ensure.NotNull(c, nameof(c));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(AdminHelpPage p)
        {
            Ensure.NotNull(p, nameof(p));
        }
    }
}