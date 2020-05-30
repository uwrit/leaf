// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Model.Tagging;
using Model.Compiler;

namespace Model.Search
{
    public interface IQueryService
    {
        Task<IEnumerable<BaseQuery>> GetQueriesAsync();
        Task<Query> GetQueryAsync(QueryUrn uid);
        Task<QuerySaveResult> InitialSaveAsync(QuerySave query);
        Task<QuerySaveResult> UpsertSaveAsync(QuerySave query);
        Task<QueryDeleteResult> DeleteAsync(QueryUrn uid, bool force);
    }
}
