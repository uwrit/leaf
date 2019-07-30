// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Cohort;
using Model.Search;

namespace API.Controllers
{
    [Route("api/dataset")]
    public class DatasetController : Controller
    {
        readonly ILogger<DatasetController> log;
        public DatasetController(ILogger<DatasetController> logger)
        {
            log = logger;
        }

        [Authorize(Policy = Access.Institutional)]
        [Authorize(Policy = TokenType.Access)]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DatasetQueryDTO>>> Get([FromServices] DatasetQueryProvider provider)
        {
            try
            {
                return Ok(new List<DatasetQueryDTO>());
                var queries = await provider.GetQueriesAsync();
                var dtos = queries.Select(q => new DatasetQueryDTO(q));
                return Ok(dtos);
            }
            catch (Exception e)
            {
                log.LogError("Failed to get dataset queries. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [AllowAnonymous]
        [HttpGet("shape/observation")]
        public ActionResult<ShapedDatasetContract> Observation()
        {
            return Ok(new DatasetContractDTO(ObservationContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/encounter")]
        public ActionResult<ShapedDatasetContract> Encounter()
        {
            return Ok(new DatasetContractDTO(EncounterContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/demographic")]
        public ActionResult<ShapedDatasetContract> Demographic()
        {
            return Ok(new DatasetContractDTO(DemographicContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/condition")]
        public ActionResult<ShapedDatasetContract> Condition()
        {
            return Ok(new DatasetContractDTO(ConditionContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/procedure")]
        public ActionResult<ShapedDatasetContract> Procedure()
        {
            return Ok(new DatasetContractDTO(ProcedureContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/immunization")]
        public ActionResult<ShapedDatasetContract> Immunization()
        {
            return Ok(new DatasetContractDTO(ImmunizationContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/allergy")]
        public ActionResult<ShapedDatasetContract> Allergy()
        {
            return Ok(new DatasetContractDTO(AllergyContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/medicationRequest")]
        public ActionResult<ShapedDatasetContract> MedicationRequest()
        {
            return Ok(new DatasetContractDTO(MedicationRequestContract.Contract));
        }

        [AllowAnonymous]
        [HttpGet("shape/medicationAdministration")]
        public ActionResult<ShapedDatasetContract> MedicationAdministration()
        {
            return Ok(new DatasetContractDTO(MedicationAdministrationContract.Contract));
        }
    }
}
