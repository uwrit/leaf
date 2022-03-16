// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Model.Dashboard
{
    public class DashboardConfigurationManager
    {
        readonly IDashboardConfigurationFetcher fetcher;
        readonly ILogger<DashboardConfigurationManager> log;

        public DashboardConfigurationManager(
            IDashboardConfigurationFetcher fetcher,
            ILogger<DashboardConfigurationManager> log)
        {
            this.fetcher = fetcher;
            this.log = log;
        }

        public async Task<IEnumerable<DashboardConfiguration>> GetAllAsync()
        {
            log.LogInformation("Fetching all dashboard configurations.");

            var configs = await fetcher.FetchAsync();

            log.LogInformation("Fetched dashboard configurations. TotalConfigurations: {}", configs.Count());

            return configs;
        }
    }
}
