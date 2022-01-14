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
            Task<IEnumerable<AdminHelpPageTitle>> GetHelpPagesAsync();
            Task<IEnumerable<AdminHelpPageCategory>> GetHelpPageCategoriesAsync();
            Task<IEnumerable<AdminHelpPageContent>> GetHelpPageContentAsync(Guid pageId);
            Task<AdminHelpPage> CreateAsync(AdminHelpPage page);
            Task<AdminHelpPage> UpdateAsync(AdminHelpPage page);
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

        public async Task<IEnumerable<AdminHelpPageTitle>> GetHelpPagesAsync()
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

        public async Task<AdminHelpPage> CreateAsync(AdminHelpPage page)
        {
            ThrowIfInvalid(page);
            try
            {
                var created = await svc.CreateAsync(page);
                log.LogInformation("Created help page. Page:{@Page}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create help page. Page:{@Page} Code:{Code} Error:{Error}", page, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<AdminHelpPage> UpdateAsync(AdminHelpPage page)
        {
            ThrowIfInvalid(page);
            try
            {
                var updated = await svc.UpdateAsync(page);
                log.LogInformation("Updated help page. Page:{@Page}", updated);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update help page. Page:{@Page} Code:{Code} Error:{Error}", page, de.ErrorCode, de.Message);
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
        void ThrowIfInvalid(AdminHelpPage page)
        {
            Ensure.NotNull(page, nameof(page));
        }
    }
}