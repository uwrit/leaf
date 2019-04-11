// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;

namespace Model.Compiler
{
    public sealed class DemographicExecutionContext : ShapedDatasetExecutionContext
    {
        public IEnumerable<SchemaFieldSelector> FieldSelectors { get; set; } // TODO(cspital) revert to internal set when refac ok

        public DemographicExecutionContext(Shape shape, QueryContext queryContext) : base(shape, queryContext)
        {
        }
    }
}
