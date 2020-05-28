// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Options;
using System.IdentityModel.Tokens.Jwt;

namespace API.Authorization
{
    public class HttpServerContext : IServerContext
    {
        readonly ClaimsPrincipal user;

        public HttpServerContext(IHttpContextAccessor accessor)
        {
            user = accessor.HttpContext.User;
        }

        string iss;
        public string Issuer
        {
            get
            {
                if (iss == null)
                {
                    iss = user.FindFirst(c => c.Type == JwtRegisteredClaimNames.Iss).Value;
                }
                return iss;
            }
        }
    }
}
