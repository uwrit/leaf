// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Options
{
    public class ClinDbOptions : IConnectionString
    {
        string connectionString;
        public string ConnectionString
        {
            get { return connectionString; }
            set
            {
                if (connectionString != null)
                {
                    throw new InvalidOperationException($"{nameof(ClinDbOptions)}.{nameof(ConnectionString)} is immutable");
                }
                connectionString = value;
            }
        }

        int defaultTimeout;
        public int DefaultTimeout
        {
            get { return defaultTimeout; }
            set
            {
                if (defaultTimeout != default)
                {
                    throw new InvalidOperationException($"{nameof(ClinDbOptions)}.{nameof(DefaultTimeout)} is immutable");
                }
                defaultTimeout = value;
            }
        }
    }
}
