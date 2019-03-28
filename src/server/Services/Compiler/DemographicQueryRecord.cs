// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Compiler;

namespace Services.Compiler
{
    public class DemographicQueryRecord
    {
        public string SqlStatement { get; set; }

        public DemographicQueryRecord() { }
        public DemographicQueryRecord(DemographicQuery query)
        {
            SqlStatement = query.SqlStatement;
        }

        public DemographicQuery ToDemographicQuery()
        {
            return new DemographicQuery
            {
                SqlStatement = SqlStatement,
            };
        }
    }
}
