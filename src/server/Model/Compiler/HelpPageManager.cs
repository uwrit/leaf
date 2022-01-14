// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.Common;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Compiler;
using Microsoft.Extensions.Logging;
using Model.Error;

namespace Model.Compiler
{
    public class HelpPageManager
    {
        public interface IHelpPageService
        {
            Task<IEnumerable<HelpPage>> GetHelpPagesAsync();
            Task<IEnumerable<HelpPageCategory>> GetHelpPageCategoriesAsync();
            Task<IEnumerable<HelpPageContent>> GetHelpPageContentAsync(Guid pageid);
        }

        readonly ILogger<HelpPageManager> logger;
        readonly IHelpPageService svc;

        public HelpPageManager(ILogger<HelpPageManager> logger, IHelpPageService svc)
        {
            this.logger = logger;
            this.svc = svc;
        }

        public async Task<IEnumerable<HelpPage>> GetHelpPagesAsync()
        {
            logger.LogInformation("Getting help pages.");
            try
            {
                return await svc.GetHelpPagesAsync();
            }
            catch (DbException de)
            {
                logger.LogError("Failed to get help pages. Error:{Error}", de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<HelpPageCategory>> GetHelpPageCategoriesAsync()
        {
            logger.LogInformation("Getting help page categories.");
            try
            {
                return await svc.GetHelpPageCategoriesAsync();
            }
            catch (DbException de)
            {
                logger.LogError("Failed to get help page categories. Error:{Error}", de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<HelpPageContent>> GetHelpPageContentAsync(Guid pageId)
        {
            logger.LogInformation("Getting help page content.");
            try
            {
                return await svc.GetHelpPageContentAsync(pageId);
            }
            catch (DbException de)
            {
                logger.LogError("Failed to get help page content. PageId:{PageId} Error:{Error}", pageId, de.Message);
                de.MapThrow();
                throw;
            }
        }
    }
}