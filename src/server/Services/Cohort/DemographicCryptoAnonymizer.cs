// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Text;
using System.Security.Cryptography;
using Model.Cohort;
using Services.Extensions;

namespace Services.Cohort
{
    public class DemographicCryptoAnonymizer : BaseDemographicAnonymizer, IDisposable
    {
        readonly MD5 hasher;

        public DemographicCryptoAnonymizer(Guid pepper) : base(pepper)
        {
            hasher = MD5.Create();
        }

        protected override string GetAnonymizedId(PatientDemographicRecord patient)
        {
            var pepper = queryPepper.ToString();
            var salt = patient.Salt.ToString();
            var id = patient.PersonId;

            var composite = pepper + salt + id;
            var bytes = Encoding.UTF8.GetBytes(composite);

            var hash = hasher.ComputeHash(bytes);

            var guid = new Guid(hash).ToString();

            var lastsection = guid.LastIndexOf('-') + 1;

            return guid.Substring(lastsection);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                hasher.Dispose();
            }
        }
    }
}
