﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Cohort
{
    public class DemographicSchemaException : ApplicationException
    {
        public DemographicSchemaException() { }
        public DemographicSchemaException(string message) : base(message) { }
        public DemographicSchemaException(string message, Exception inner) : base(message, inner) { }
    }
}
