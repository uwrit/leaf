// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Cohort;
using Model.Compiler;
using System.Linq;

namespace API.DTO.Cohort
{
    public class DatasetResultSchemaDTO
    {
        public Shape Shape { get; set; }
        public IEnumerable<string> Fields { get; set; }

        public DatasetResultSchemaDTO(ShapedDatasetSchema schema)
        {
            Shape = schema.Shape;
            Fields = schema.Fields.Select(f => f.Name);
        }
    }
}
