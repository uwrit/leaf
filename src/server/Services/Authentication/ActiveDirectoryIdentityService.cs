// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading.Tasks;
using Model.Authentication;
using Services.Authorization;
using System.DirectoryServices.AccountManagement;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Options;
using System.Collections.Generic;

namespace Services.Authentication
{
    public class ActiveDirectoryIdentityService : ILoginService, IFederatedIdentityService
    {
        readonly ActiveDirectoryService adService;
        readonly UserPrincipalContext userContext;
        readonly ActiveDirectoryCache adCache;

        public ActiveDirectoryIdentityService(
            ActiveDirectoryService activeDirectoryService,
            UserPrincipalContext userPrincipalContext,
            ActiveDirectoryCache activeDirectoryCache
        )
        {
            adService = activeDirectoryService;
            userContext = userPrincipalContext;
            adCache = activeDirectoryCache;
        }

        public Task<bool> AuthenticateAsync(LoginCredentials credentials)
        {
            if (adService.ValidateCredentials(credentials, out var adUser))
            {
                userContext.User = adUser;
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }

        public IScopedIdentity GetIdentity(HttpContext context)
        {
            return new ActiveDirectoryScopedIdentity(userContext.UserPrincipalName);
        }
    }
}
