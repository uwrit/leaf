// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;

namespace Model.Admin.Compiler
{
    public class SqlConfiguration
    {
        public string Alias { get; set; }
        public string FieldPersonId { get; set; }
        public string FieldEncounterId { get; set; }

        public static SqlConfiguration From(CompilerOptions options)
        {
            return new SqlConfiguration
            {
                Alias = options.Alias,
                FieldPersonId = options.FieldPersonId,
                FieldEncounterId = options.FieldEncounterId
            };
        }
    }
}