﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    public abstract class ShapedDataset
    {
        [Field(Name = DatasetColumns.PersonId, Type = LeafType.String, Required = true, Phi = true, Mask = true)]
        public string PersonId { get; set; }

        public virtual object Result()
        {
            return this;
        }
    }
}
