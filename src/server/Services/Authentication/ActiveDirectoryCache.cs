// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using Model.Authorization;

namespace Services.Authentication
{
    public class ActiveDirectoryCache
    {
        public LDAPGroup Users { get; }
        public LDAPGroup Admins { get; }
        public LDAPGroup Supers { get; }

        public ActiveDirectoryCache(
            IOptions<ActiveDirectoryAuthorizationOptions> adOptions,
            HashSet<string> users,
            HashSet<string> admins,
            HashSet<string> supers
        )
        {
            var roles = adOptions.Value.RolesMapping;
            Users = new LDAPGroup(roles.User, users);
            Admins = new LDAPGroup(roles.Admin, admins);
            Supers = new LDAPGroup(roles.Super, supers);
        }

        public bool CanLogin(string username)
        {
            return Users.IsMember(username) || Admins.IsMember(username) || Supers.IsMember(username);
        }
    }
}
