// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Composure;
using Model.Options;

namespace Model.Import
{
    public class ImportMappingQuery
    {
        readonly NamedSet set = new NamedSet();
        readonly List<IEvaluatable> where = new List<IEvaluatable>();

        public ImportMappingQuery(CompilerOptions compilerOptions, ImportMappingOptions opts, IEnumerable<string> ids)
        {
            if (!string.IsNullOrWhiteSpace(opts.WhereClause))
            {
                where.Add(new RawEval(opts.WhereClause));
            }
            where.Add(new Column(opts.FieldMrn) == ids);

            set.Select = new[] { new Column(compilerOptions.FieldPersonId), new Column(opts.FieldMrn) };
            set.From = opts.SetMrn;
            set.Where = where;
        }

        public override string ToString()
        {
            return set.ToString();
        }
    }
}
