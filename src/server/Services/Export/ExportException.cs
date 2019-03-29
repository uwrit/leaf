// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Runtime.Serialization;

namespace Services.Export
{
    public class ExportException : ApplicationException
    {
        public ExportException(int sc)
        {
            StatusCode = sc;
        }

        public ExportException(int sc, string message) : base(message)
        {
            StatusCode = sc;
        }

        public ExportException(int sc, string message, Exception innerException) : base(message, innerException)
        {
            StatusCode = sc;
        }

        public int StatusCode { get; set; }
    }
}
