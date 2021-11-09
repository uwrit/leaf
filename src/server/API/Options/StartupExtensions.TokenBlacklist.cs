// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Model.Authentication;
using Model.Authorization;
using Microsoft.Extensions.Logging;

namespace API.Options
{
    public static partial class StartupExtensions
    {
        public static IApplicationBuilder UseTokenInvalidatedMiddleware(this IApplicationBuilder app)
        {
            var sp = app.ApplicationServices;
            var cache = sp.GetRequiredService<ITokenInvalidatedCache>();
            var logger = sp.GetRequiredService<ILogger<TokenInvalidatedMiddleware>>();

            return app.UseMiddleware<TokenInvalidatedMiddleware>(cache, logger);
        }

        class TokenInvalidatedMiddleware
        {
            readonly RequestDelegate next;
            readonly ITokenInvalidatedCache cache;
            readonly ILogger<TokenInvalidatedMiddleware> logger;

            public TokenInvalidatedMiddleware(RequestDelegate next, ITokenInvalidatedCache cache, ILogger<TokenInvalidatedMiddleware> logger)
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
                    if (cache.IsInvalidated(idNonce))
                    {
                        logger.LogWarning("Attempted use of invalidated token: {idNonce}", idNonce.ToString());
                        context.Response.StatusCode = 401;
                        return;
                    }
                }

                await next(context);
            }
        }
    }
}
