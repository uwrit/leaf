// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Collections.Generic;
using Model.Compiler;

namespace Services.Compiler
{
    public abstract class ShapedDatasetExecutionContext
    {
        public Shape Shape { get; }
        public string CompiledQuery { get; internal set; }

        readonly List<SqlParameter> parameters;
        public IEnumerable<SqlParameter> Parameters => parameters;

        public QueryContext QueryContext { get; }

        protected ShapedDatasetExecutionContext(Shape shape, QueryContext queryContext)
        {
            Shape = shape;
            QueryContext = queryContext;
            parameters = new List<SqlParameter>();
        }

        public void AddParameter(string parameterName, DateTime value)
        {
            parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddParameter(string parameterName, Guid value)
        {
            parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddParameter(SqlParameter parameter)
        {
            parameters.Add(parameter);
        }

        public void AddParameters(IEnumerable<SqlParameter> sqlParameters)
        {
            parameters.AddRange(sqlParameters);
        }
    }
}
