// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Builder;

namespace API.Middleware.Federation
{
    public static class FederationExtensions
    {
        public static IApplicationBuilder UseRejectIdentifiedFederationMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RejectIdentifiedFederationMiddleware>();
        }
    }
}
