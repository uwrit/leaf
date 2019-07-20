// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;
using System.Dynamic;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    [Schema(Shape = Shape.Dynamic)]
    public class DynamicShapedDatum : ShapedDataset
    {
        public Dictionary<string, object> KeyValues = new Dictionary<string, object>();

        public override object Result()
        {
            var x = new ExpandoObject();

            foreach (var d in KeyValues)
            {
                x.TryAdd(d.Key, d.Value);
            }
            return x;
        }
    }
}
