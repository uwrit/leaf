// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class CohortOptions
    {
        public const string CTE = @"CTE";
        public const string Parallel = @"PARALLEL";

        public int RowLimit { get; set; }
        public int ExportLimit { get; set; }
        public QueryStrategyOptions QueryStrategy { get; set; }

        public static readonly IEnumerable<string> ValidQueryStrategies = new string[] { CTE, Parallel };

        static bool ValidQueryStrategy(string value) => ValidQueryStrategies.Contains(value);

        public CohortOptions WithQueryStrategy(string value)
        {
            var tmp = value.ToUpper();
            if (!ValidQueryStrategy(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a supported a cohort query strategy");
            }

            switch (tmp)
            {
                case CTE:
                    QueryStrategy = QueryStrategyOptions.CTE;
                    break;
                case Parallel:
                    QueryStrategy = QueryStrategyOptions.Parallel;
                    break;
            }

            return this;
        }
    }

    public enum QueryStrategyOptions : ushort
    {
        CTE = 1,
        Parallel = 2
    }
}
