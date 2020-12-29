// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
namespace Model.Cohort
{
    public class ConceptDataset
    {
        public IReadOnlyCollection<ConceptDatasetRow> Rows { get; private set; }

        public ConceptDataset() { }

        public ConceptDataset(IEnumerable<ConceptDatasetRow> rows)
        {
            Rows = rows.ToList().AsReadOnly();
        }

        public class ConceptDatasetRow
        {
            public string PersonId { get; private set; }
            public DateTime Date { get; private set; }
            public decimal NumericValue { get; private set; }

            public ConceptDatasetRow(string personId, DateTime date)
            {
                PersonId = personId;
                Date = date;
            }

            public ConceptDatasetRow(string personId, DateTime date, decimal numericValue)
            {
                PersonId = personId;
                Date = date;
                NumericValue = numericValue;
            }
        }
    }
}
