// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public abstract class ShapedDatasetExecutionContext
    {
        public Shape Shape { get; }
        public string CompiledQuery { get; set; } // TODO(cspital) revert to internal set when refac ok

        readonly List<QueryParameter> parameters;
        public IEnumerable<QueryParameter> Parameters => parameters;

        public QueryContext QueryContext { get; }

        protected ShapedDatasetExecutionContext(Shape shape, QueryContext queryContext)
        {
            Shape = shape;
            QueryContext = queryContext;
            parameters = new List<QueryParameter>();
        }

        public void AddParameter(string parameterName, DateTime value)
        {
            parameters.Add(new QueryParameter(parameterName, value));
        }

        public void AddParameter(string parameterName, Guid value)
        {
            parameters.Add(new QueryParameter(parameterName, value));
        }

        public void AddParameter(QueryParameter parameter)
        {
            parameters.Add(parameter);
        }

        public void AddParameters(IEnumerable<QueryParameter> sqlParameters)
        {
            parameters.AddRange(sqlParameters);
        }
    }
}
