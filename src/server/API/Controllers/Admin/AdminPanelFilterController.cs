// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using API.DTO.Admin.Compiler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Error;
using Model.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/panelfilter")]
    public class AdminPanelFilterController : Controller
    {
        readonly ILogger<AdminPanelFilterController> logger;
        readonly AdminPanelFilterManager manager;

        public AdminPanelFilterController(
            ILogger<AdminPanelFilterController> logger,
            AdminPanelFilterManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminPanelFilter>>> Get()
        {
            try
            {
                var panelFilters = await manager.GetAsync();
                return Ok(panelFilters);
            }
            catch (Exception ex)
            {
                return 
            }
        }
    }
}