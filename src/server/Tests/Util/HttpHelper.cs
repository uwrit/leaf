// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Tests.Util
{
    public static class HttpHelper
    {
        public static HttpContext GetHttpContext(params (string, string)[] headers)
        {
            var ctx = new DefaultHttpContext();
            foreach (var pair in headers)
            {
                ctx.Request.Headers[pair.Item1] = pair.Item2;
            }
            return ctx;
        }

        public static HttpContext GetHttpContext(ClaimsPrincipal user, params (string, string)[] headers)
        {
            var ctx = GetHttpContext(headers);
            ctx.User = user;
            return ctx;
        }
    }
}
