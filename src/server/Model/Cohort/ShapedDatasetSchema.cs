// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;
using System.Linq;

// TODO(cspital) write tests for this, make sure fields get pruned correctly

namespace Model.Cohort
{
    public class ShapedDatasetSchema : Schema<BaseSchemaField>
    {
        public ShapedDatasetSchema()
        {

        }

        ShapedDatasetSchema(Shape shape, ICollection<BaseSchemaField> fields)
        {
            Shape = shape;
            Fields = fields;
        }

        public static ShapedDatasetSchema From(DatasetResultSchema resultSchema)
        {
            var contract = ShapedDatasetContract.For(resultSchema.Shape);
            var fields = resultSchema.Fields.Where(f => contract.Fields.Contains<BaseSchemaField>(f)).ToArray();
            return new ShapedDatasetSchema
            {
                Shape = resultSchema.Shape,
                Fields = fields
            };
        }
    }
}
