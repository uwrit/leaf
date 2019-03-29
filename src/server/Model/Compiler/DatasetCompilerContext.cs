// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Compiler
{
    public abstract class ShapedDatasetCompilerContext
    {
        public QueryContext QueryContext { get; set; }
        public virtual Shape Shape { get; }

        public const string QueryIdParam = "@queryid";
    }

    public class DatasetCompilerContext : ShapedDatasetCompilerContext
    {
        public DatasetQuery DatasetQuery { get; set; }
        public DateTime? EarlyBound { get; set; }
        public DateTime? LateBound { get; set; }

        public override Shape Shape => DatasetQuery.Shape;
    }

    public class DemographicCompilerContext : ShapedDatasetCompilerContext
    {
        public override Shape Shape => Shape.Demographic;
        public DemographicQuery DemographicQuery { get; set; }
    }

    public class CompilerValidationContext<T> where T : ShapedDatasetCompilerContext
    {
        public T Context { get; set; }
        public CompilerContextState State { get; set; }
    }
}
