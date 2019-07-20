// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Cohort;
using Model.Compiler;

namespace API.DTO.Cohort
{
    public class DatasetDTO
    {
        public DatasetResultSchemaDTO Schema { get; set; }
        public Dictionary<string, IEnumerable<object>> Results { get; set; }

        public DatasetDTO()
        {

        }

        public DatasetDTO(Dataset dataset)
        {
            Schema = dataset.Schema.Shape == Shape.Dynamic
                ? new DynamicDatasetResultSchemaDTO(dataset.Schema.Contract as DynamicContract)
                : new DatasetResultSchemaDTO(dataset.Schema);
            Results = dataset.Results;
        }

        public DatasetDTO(DatasetProvider.Result result) : this(result.Dataset)
        {
        }
    }
}
