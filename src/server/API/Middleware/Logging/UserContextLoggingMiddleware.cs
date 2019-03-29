// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Serilog;
using Serilog.Context;
using Services.Extensions;
using System.Security.Claims;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using Model.Authorization;

namespace API.Middleware.Logging
{
    public class UserContextLoggingMiddleware : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var (uuid, nonce) = ContextualUserValues(context.User);
            using (LogContext.PushProperty("User", uuid))
            {
                using (LogContext.PushProperty("SessionId", nonce))
                {
                    await next(context);
                }
            }
        }

        (string, string) ContextualUserValues(ClaimsPrincipal user)
        {
            if (user == null)
            {
                return (null, null);
            }
            var issuer = user?.FindFirstValue(JwtRegisteredClaimNames.Iss);
            var username = user?.Identity?.Name;
            var uuid = (issuer == null || username == null) ? null : $"{username}@{issuer}";
            var nonce = user?.FindFirstValue(Nonce.Access);

            return (uuid, nonce);
        }
    }
}
