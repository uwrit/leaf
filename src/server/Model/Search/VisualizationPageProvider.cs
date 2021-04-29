// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Visualization;
using Microsoft.Extensions.Logging;

namespace Model.Search
{
    /// <summary>
    /// Visualization Page provider.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class VisualizationPageProvider
    {
        readonly ILogger<VisualizationPageProvider> log;
        readonly IVisualizationPageFetcher fetcher;

        public VisualizationPageProvider(
            ILogger<VisualizationPageProvider> logger,
            IVisualizationPageFetcher fetcher)
        {
            log = logger;
            this.fetcher = fetcher;
        }

        /// <summary>
        /// Gets all visualization pages that the user is permitted to use.
        /// </summary>
        /// <returns>The visualizations.</returns>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<IEnumerable<IVisualizationPage>> GetVisualizationPagesAsync()
        {
            log.LogInformation("Getting visualiation pages.");
            return await fetcher.GetVisualizationPagesAsync();
        }
    }
}
