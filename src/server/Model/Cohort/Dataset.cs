// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;
using System.Linq;

namespace Model.Cohort
{
    public interface IDatasetResult
    {

    }

    public class MultirowDatasetResult : Dictionary<string, IEnumerable<object>>, IDatasetResult
    {

    }

    public class SingletonDatasetResult: Dictionary<string, object>, IDatasetResult
    {

    }


    public class Dataset
    {
        public ShapedDatasetSchema Schema { get; }
        public Dictionary<string, IEnumerable<object>> Results { get; }

        public Dataset(ShapedDatasetSchema schema,
            IEnumerable<ShapedDataset> data)
        {
            Schema = schema;
            Results = data.GroupBy(d => d.PersonId).ToDictionary(g => g.Key, g => g.Select(r => r.Result()));
        }
    }
}
