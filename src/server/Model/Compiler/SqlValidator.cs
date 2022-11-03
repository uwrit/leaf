﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class SqlValidator
    {
        readonly IEnumerable<string> illegalOps;

        public SqlValidator(IEnumerable<string> illegalOps)
        {
            this.illegalOps = illegalOps;
        }

        int CountIllegal(string inputSql)
        {
            return illegalOps.Count(inputSql.ToUpper().Contains);
        }

        public void Validate(string inputSql)
        {
            var count = CountIllegal(inputSql);

            if (count > 0)
            {
                throw new LeafCompilerException($"{count} illegal SQL CRUD operation(s) found in SQL: {inputSql}");
            }
        }

        public void Validate(DatasetQuery datasetQuery)
        {
            var count = CountIllegal(datasetQuery.SqlStatement);

            if (count > 0)
            {
                throw new LeafCompilerException($"{count} illegal SQL CRUD operation(s) found in dataset: Id:{datasetQuery.Id} Name:{datasetQuery.Name} SQL:{datasetQuery.SqlStatement}");
            }
        }

        public void Validate(DemographicQuery demographicQuery)
        {
            var count = CountIllegal(demographicQuery.SqlStatement);

            if (count > 0)
            {
                throw new LeafCompilerException($"{count} illegal SQL CRUD operation(s) found in demographic: SQL:{demographicQuery.SqlStatement}");
            }
        }
    }
}
