// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;

namespace Model.Compiler
{
    public class PatientCountQuery
    {
        public Guid? QueryId { get; set; }
        public IEnumerable<Panel> Panels { get; set; }
    }

    public interface IPatientCountQueryDTO : IQueryDefinition
    {
        string QueryId { get; }
    }
}
