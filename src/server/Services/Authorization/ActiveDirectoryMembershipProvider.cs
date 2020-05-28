// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.DirectoryServices.AccountManagement;
using System.DirectoryServices;
using Model.Authentication;
using Model.Authorization;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Services.Authorization
{
    public class ActiveDirectoryMembershipProvider : IMembershipProvider
    {
        readonly ContextOptions optionMask;
        readonly DomainConnectionOptions domain;
        PrincipalContext Context
        {
            get
            {
                var cnxn = $"{domain.Server}:{domain.SSLPort}";
                return new PrincipalContext(ContextType.Domain, cnxn, null, optionMask, domain.Username, domain.Password);
            }
        }

        public ActiveDirectoryMembershipProvider(IOptions<ActiveDirectoryAuthorizationOptions> adOpts)
        {
            domain = adOpts.Value?.DomainConnection;
            optionMask = ContextOptions.Negotiate | ContextOptions.Signing | ContextOptions.Sealing | ContextOptions.SecureSocketLayer;
        }

        public IEnumerable<string> GetMembers(string group)
        {
            var filter = new GroupPrincipal(Context)
            {
                SamAccountName = group
            };
            var ps = new PrincipalSearcher(filter);

            if (ps.FindOne() is GroupPrincipal adGroup)
            {
                return adGroup.GetMembers(true)
                              .OfType<UserPrincipal>()
                              .Where(u => u != null && u.Enabled.HasValue && u.Enabled.Value)
                              .Select(u => u.SamAccountName);
            }

            return new string[] { };
        }

        public IEnumerable<string> GetMembership(string username)
        {
            var user = GetUser(Context, username);
            if (user != null)
            {
                return GetMembership(user);
            }
            return new string[] { };
        }

        IEnumerable<string> GetMembership(UserPrincipal user)
        {
            return user.GetGroups()
                       .Select(g => (g as GroupPrincipal)?.SamAccountName)
                       .Where(g => g != null);
        }

        UserPrincipal GetUser(PrincipalContext context, string username)
        {
            var filter = new UserPrincipal(context)
            {
                SamAccountName = username
            };
            var ps = new PrincipalSearcher(filter);

            if (ps.FindOne() is UserPrincipal adUser)
            {
                return adUser;
            }
            return null;
        }
    }
}
