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

namespace Model.Admin.Query
{
    public class AdminQueryManager
    {
        public interface IAdminQueryService
        {
            Task<IEnumerable<LeafUser>> SearchUsersAsync(string term);
            Task<IEnumerable<BaseQuery>> GetUserQueriesAsync(LeafUser user);
        }

        readonly IAdminQueryService svc;
        readonly ILogger<AdminQueryManager> log;

        public AdminQueryManager(
            IAdminQueryService service,
            ILogger<AdminQueryManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<IEnumerable<LeafUser>> SearchUsersAsync(string term)
        {
            try
            {
                log.LogInformation("Searching Leaf users. Term:{@term}", term);
                var users = await svc.SearchUsersAsync(term);
                return users;
            }
            catch (DbException db)
            {
                log.LogError("Failed to search for Leaf users. Term:{@term}", term, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<BaseQuery>> GetUserQueriesAsync(LeafUser user)
        {
            try
            {
                log.LogInformation("Getting user queries. User:{@user}", user);
                var queries = await svc.GetUserQueriesAsync(user);
                return queries;
            }
            catch (DbException db)
            {
                log.LogError("Failed to get Leaf user queries. User:{@user}", user, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }
    }
}
