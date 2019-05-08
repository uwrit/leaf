// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using Model.Options;

namespace API.Controllers.Base
{
    /// <summary>
    /// Higher-order controller that, when given an IOptions where T: class, <see cref="IEnabled"/>, new(),
    /// will short-circuit the route and return 404.
    /// 
    /// This class is meant to be derived from on routes that may or may not need to perform an action,
    /// depending on the systems configuration.
    /// </summary>
    /// <typeparam name="T">Any POCO implementing <see cref="IEnabled"/></typeparam>
    public class MaybeController<T> : Controller where T : class, IEnabled, new()
    {
        /// <summary>
        /// Any set of options that can be boiled down to enabled/disabled.
        /// </summary>
        protected readonly T maybeOpts;

        public MaybeController(IOptions<T> opts)
        {
            maybeOpts = opts.Value;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!maybeOpts.Enabled)
            {
                context.Result = NotFound();
            }
            base.OnActionExecuting(context);
        }
    }
}