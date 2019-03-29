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
using Services.Authorization;
using Microsoft.Extensions.Logging;

namespace API.Middleware.Federation
{
    public class RejectIdentifiedFederationMiddleware : IMiddleware
    {
        readonly IUserContext user;
        readonly ILogger<RejectIdentifiedFederationMiddleware> logger;

        public RejectIdentifiedFederationMiddleware(IUserContext userContext, ILogger<RejectIdentifiedFederationMiddleware> logger)
        {
            this.user = userContext;
            this.logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            // if authenticated and identified and not from this institution
            if (user != null && user.Identified && !user.IsInstutional)
            {
                logger.LogWarning("Identified Federated Access Blocked");
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }

            // anonymous endpoint, or deidentified, or from this instution
            await next(context);
        }
    }
}
