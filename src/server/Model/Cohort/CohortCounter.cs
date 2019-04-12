// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;

namespace Model.Cohort
{
    public class CohortCounter
    {
        readonly IPanelConverterService converter;
        readonly IPanelValidator validator;
        readonly IPatientCountService counter;

        public CohortCounter(IPanelConverterService converter,
            IPanelValidator validator,
            IPatientCountService counter)
        {
            this.converter = converter;
            this.validator = validator;
            this.counter = counter;
        }

        public async Task<CohortCount> Count(IPatientCountQueryDTO queryDTO, CancellationToken cancelToken)
        {
            var ctx = await converter.GetPanelsAsync(queryDTO, cancelToken);
            if (!ctx.PreflightPassed)
            {
                return new CohortCount
                {
                    ValidationContext = ctx
                };
            }

            var query = validator.Validate(ctx);
            var patientCount = await counter.GetPatientCountAsync(query, cancelToken);

            return new CohortCount
            {
                ValidationContext = ctx,
                Count = patientCount
            };
        }
    }

    public class CohortCount
    {
        public PanelValidationContext ValidationContext { get; internal set; }
        public PatientCount Count { get; internal set; }
    }
}
