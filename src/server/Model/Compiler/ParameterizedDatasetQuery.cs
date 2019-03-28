// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public class ParameterizedDatasetQuery
    {
        public string CteComponent { get; private set; }
        public string GrabSql { get; private set; }
        public const string Parameter = @"@queryId";

        public ParameterizedDatasetQuery(string cte, string grab)
        {
            CteComponent = cte;
            GrabSql = grab;
        }

        public string SqlStatement
        {
            get
            {
                return $"{CteComponent} {GrabSql};";
            }
        }
    }
}
