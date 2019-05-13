// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Model.Authorization;

namespace API.Middleware.Federation
{
    public class RejectInvalidFederatedUserMiddleware : IMiddleware
    {
        readonly IUserContext user;
        readonly ILogger<RejectInvalidFederatedUserMiddleware> logger;

        public RejectInvalidFederatedUserMiddleware(IUserContext userContext, ILogger<RejectInvalidFederatedUserMiddleware> logger)
        {
            this.user = userContext;
            this.logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            // anonymous users are delegated to controller for authorization
            if (user != null)
            {
                // user is identified and not from this institution
                if (FederatedIdentified)
                {
                    logger.LogWarning("Identified Federated Access Blocked");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return;
                }

                // user is quarantined and not from this institution
                if (FederatedQuarantined)
                {
                    logger.LogWarning("Quarantined User Blocked");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return;
                }
            }
            
            await next(context);
        }

        public bool FederatedIdentified => user.Identified && !user.IsInstutional;

        public bool FederatedQuarantined => user.IsQuarantined && !user.IsInstutional;
    }
}
