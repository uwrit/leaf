// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Dynamic;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    [Schema(Shape = Shape.Dynamic)]
    public class DynamicShapedDatumSet : ShapedDataset
    {
        readonly Dictionary<string, object> _keyValues = new Dictionary<string, object>();

        public DynamicShapedDatumSet()
        {

        }

        public DynamicShapedDatumSet(Dictionary<string, object> keyValues)
        {
            PersonId = keyValues[DatasetColumns.PersonId].ToString();
            keyValues.Remove(DatasetColumns.PersonId);
            _keyValues = keyValues;
        }

        public override object Result()
        {
            var expando = new ExpandoObject() as IDictionary<string, object>;

            foreach(var pair in _keyValues)
            {
                expando[pair.Key] = pair.Value;
            }

            dynamic dyn = expando;
            dyn.PersonId = PersonId;

            return dyn;
        }

    }
}
