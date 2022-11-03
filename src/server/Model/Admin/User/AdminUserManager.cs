// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Error;

namespace Model.Admin.User
{
    public class AdminUserManager
    {
        public interface IAdminUserService
        {
            Task<IEnumerable<LeafUser>> SearchUsersAsync(string term);
        }

        readonly IAdminUserService svc;
        readonly ILogger<AdminUserManager> log;

        public AdminUserManager(
            IAdminUserService service,
            ILogger<AdminUserManager> log)
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
    }
}
