// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Search;
using Model.Compiler;
using Microsoft.Extensions.Logging;

namespace Model.Search
{
    /// <summary>
    /// Dataset query provider.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class DatasetQueryProvider
    {
        readonly ILogger<DatasetQueryProvider> log;
        readonly IDatasetQueryFetcher fetcher;

        public DatasetQueryProvider(
            ILogger<DatasetQueryProvider> logger,
            IDatasetQueryFetcher fetcher)
        {
            log = logger;
            this.fetcher = fetcher;
        }

        /// <summary>
        /// Gets all dataset queries that the user is permitted to use.
        /// </summary>
        /// <returns>The queries.</returns>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<IEnumerable<IDatasetQuery>> GetQueriesAsync()
        {
            log.LogInformation("Getting dataset queries.");
            return await fetcher.GetDatasetQueriesAsync();
        }
    }
}
