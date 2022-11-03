// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Cohort;
using API.DTO.Compiler;

namespace API.DTO.Cohort
{
    public class CohortCountDTO
    {
        public string QueryId { get; set; }
        public bool Cached { get; set; }
        public PreflightCheckDTO Preflight { get; set; }
        public PatientCountResultDTO Result { get; set; }

        public CohortCountDTO(CohortCounter.Result cohort) : this(cohort.ValidationContext.PreflightCheck, cohort.Count)
        {

        }

        public CohortCountDTO(PreflightResources preflight)
        {
            Preflight = new PreflightCheckDTO(preflight);
        }

        public CohortCountDTO(PreflightResources preflight, PatientCount count) : this(preflight)
        {
            QueryId = count.QueryId.ToString();
            Cached = count.Cached;

            if (count != null)
            {
                Result = new PatientCountResultDTO
                {
                    PlusMinus = count.PlusMinus,
                    SqlStatements = count.SqlStatements,
                    Value = count.Value,
                    WithinLowCellThreshold = count.WithinLowCellThreshold
                };
            }
        }
    }
}
