// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using Model.Authentication;
using Model.Authorization;
using Services.Authentication;
using API.Options;
using Microsoft.Extensions.Logging;

namespace API.Options
{
    public static partial class StartupExtensions
    {
        public static IApplicationBuilder UseTokenBlacklistMiddleware(this IApplicationBuilder app)
        {
            var sp = app.ApplicationServices;
            var cache = sp.GetRequiredService<ITokenBlacklistCache>();
            var logger = sp.GetRequiredService<ILogger<TokenBlacklistMiddleware>>();

            return app.UseMiddleware<TokenBlacklistMiddleware>(cache, logger);
        }

        class TokenBlacklistMiddleware
        {
            readonly RequestDelegate next;
            readonly ITokenBlacklistCache cache;
            readonly ILogger<TokenBlacklistMiddleware> logger;

            public TokenBlacklistMiddleware(RequestDelegate next, ITokenBlacklistCache cache, ILogger<TokenBlacklistMiddleware> logger)
            {
                this.next = next;
                this.cache = cache;
                this.logger = logger;
            }

            public async Task Invoke(HttpContext context)
            {
                var user = context.User;
                var authenticated = user?.Identity?.IsAuthenticated;
                if (authenticated.HasValue && authenticated.Value)
                {
                    var idNonce = new Guid(user.FindFirstValue(Nonce.Id));
                    if (cache.IsBlacklisted(idNonce))
                    {
                        logger.LogWarning("Attempted use of blacklisted token: {idNonce}", idNonce.ToString());
                        context.Response.StatusCode = 401;
                        return;
                    }
                }

                await next(context);
            }
        }
    }
}
