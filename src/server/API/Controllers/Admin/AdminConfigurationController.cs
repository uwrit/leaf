// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Admin;
using Model.Options;
using Microsoft.Extensions.Options;
using Model.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/config")]
    public class AdminConfigurationController : ControllerBase
    {
        readonly ILogger<AdminConfigurationController> logger;
        readonly CompilerOptions options;

        public AdminConfigurationController(ILogger<AdminConfigurationController> logger, IOptions<CompilerOptions> options)
        {
            this.logger = logger;
            this.options = options.Value;
        }

        [HttpGet("sql")]
        public ActionResult<SqlConfiguration> Get()
        {
            return Ok(SqlConfiguration.From(options));
        }
    }
}