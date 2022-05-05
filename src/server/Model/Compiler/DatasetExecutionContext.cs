// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public class DatasetExecutionContext : ShapedDatasetExecutionContext
    {
        public Guid DatasetId { get; }

        public DatasetExecutionContext(Shape shape, QueryContext queryContext, Guid datasetId) : base(shape, queryContext)
        {
            DatasetId = datasetId;
        }

        public CleanedDatasetExecutionContext ToCleaned()
        {
            return new CleanedDatasetExecutionContext
            {
                Shape = Shape,
                CompiledQuery = CompiledQuery,
                Parameters = Parameters,
                DatasetQuery = DatasetQuery,
                QueryContext = QueryContext
            };
        }

        public class CleanedDatasetExecutionContext
        {
            public Shape Shape { get; set; }
            public string CompiledQuery { get; internal set; }

            public IEnumerable<QueryParameter> Parameters { get; set; }

            public QueryContext QueryContext { get; set; }

            public IDatasetQuery DatasetQuery { get; set; }
        }
    }
}