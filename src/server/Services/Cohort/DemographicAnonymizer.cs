// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Text;
using Model.Cohort;
using Model.Extensions;

namespace Services.Cohort
{
    public class DemographicAnonymizer : BaseDemographicAnonymizer, IDisposable
    {
        public DemographicAnonymizer(Guid pepper) : base(pepper) { }

        protected override string GetAnonymizedId(PatientDemographicRecord patient)
        {
            var pepper = queryPepper.ToString();
            var salt = patient.Salt.ToString();
            var id = patient.PersonId;

            var composite = pepper + salt + id;

            return composite.GetConsistentHashCode().ToString();
        }

        public void Dispose() { }
    }
}
