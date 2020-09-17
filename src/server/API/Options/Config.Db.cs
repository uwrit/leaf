// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Options
{
    public static partial class Config
    {
        public static class Db
        {
            public static class App
            {
                public const string Section = @"Db:App";
                public const string Connection = @"Db:App:Connection";
                public const string DefaultTimeout = @"Db:App:DefaultTimeout";
            }
            public static class Clin
            {
                public const string Section = @"Db:Clin";
                public const string Connection = @"Db:Clin:Connection";
                public const string DefaultTimeout = @"Db:Clin:DefaultTimeout";

                public static class Cohort
                {
                    public const string QueryStrategy = @"Db:Clin:Cohort:QueryStrategy";
                    public const string MaxParallelThreads = @"Db:Clin:Cohort:MaxParallelThreads";
                }
            }
        }
    }
}
