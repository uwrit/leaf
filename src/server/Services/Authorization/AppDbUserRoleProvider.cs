// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Authentication;
using Model.Options;
using Dapper;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Options;
using Model.Authorization;

namespace Services.Authorization
{
    public class AppDbUserRoleProvider : IDbUserRoleAndGroupProvider
    {
        readonly AppDbOptions opts;

        public AppDbUserRoleProvider(IOptions<AppDbOptions> options)
        {
            opts = options.Value;
        }

        public IDbUserRoleAndGroupProvider.UserDbEntitlements FetchEntitlements(IScopedIdentity identity)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                cn.Open();

                var grid = cn.QueryMultiple(
                    Sql.Get,
                    new
                    {
                        scopedId = identity.ScopedIdentity
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return HydrateEntitlements(grid);
            }
        }

        IDbUserRoleAndGroupProvider.UserDbEntitlements HydrateEntitlements (SqlMapper.GridReader grid)
        {
            var roles = grid.Read<IDbUserRoleAndGroupProvider.UserRoles>().FirstOrDefault();
            var groups = grid.Read<GroupNameRecord>().Select(r => r.GroupName);

            if (roles == null)
            {
                roles = new IDbUserRoleAndGroupProvider.UserRoles();
            }

            return new IDbUserRoleAndGroupProvider.UserDbEntitlements
            {
                Roles = roles,
                Groups = groups
            };
        }

        static class Sql
        {
            public const string Get = @"auth.sp_GetUserGroupsAndRoles";
        }

        class GroupNameRecord
        {
            public string GroupName { get; set; }
        }
    }
}
