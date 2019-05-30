using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Model.Authorization;
using Microsoft.Extensions.Logging;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/dataset")]
    public class AdminDatasetController : Controller
    {
        readonly ILogger<AdminDatasetController> log;

        public AdminDatasetController(
            ILogger<AdminDatasetController> log)
        {
            this.log = log;
        }


    }
}
