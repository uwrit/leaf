// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Data.Common;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Compiler;
using Microsoft.Extensions.Logging;
using Model.Error;
namespace Model.Help
{
    public class HelpPages
    {
        public interface IHelpPages
        {
            Task<IEnumerable<HelpPageSql>> GetAllPagesAsync();
            Task<IEnumerable<HelpPageContentSql>> GetPageContentAsync(int pageid);
            Task<IEnumerable<HelpPageCategorySql>> GetHelpPageCategoriesAsync();
        }

        readonly IHelpPages help;
        readonly ILogger<HelpPages> log;

        public HelpPages(IHelpPages help, ILogger<HelpPages> logger)
        {
            this.help = help;
            log = logger;
        }

        public async Task<IEnumerable<HelpPageSql>> GetAllPagesAsync()
        {
            log.LogInformation("Getting all help pages.");
            try
            {
                return await help.GetAllPagesAsync();
            }
            catch (DbException de)
            {
                log.LogError("Failed to get all help pages. Error:{Error}", de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<HelpPageCategorySql>> GetHelpPageCategoriesAsync()
        {
            log.LogInformation("Getting all help categories.");
            try
            {
                return await help.GetHelpPageCategoriesAsync();
            }
            catch (DbException de)
            {
                log.LogError("Failed to get help page categories. Error:{Error}", de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<HelpPageContentSql>> GetPageContentAsync(int pageid)
        {
            log.LogInformation("Getting all help pages.");
            try
            {
                return await help.GetPageContentAsync(pageid);
            }
            catch (DbException de)
            {
                log.LogError("Failed to get all help pages. PageId:{PageId} Error:{Error}", pageid, de.Message);
                de.MapThrow();
                throw;
            }
        }
    }
}
