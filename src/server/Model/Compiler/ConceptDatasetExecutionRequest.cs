// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Extensions;

namespace Model.Compiler
{
    public class ConceptDatasetExecutionRequest
    {
        public QueryRef QueryRef { get; set; }
        public IPanelItemDTO PanelItem { get; set; }
        public DateTime? EarlyBound { get; set; }
        public DateTime? LateBound { get; set; }

        public ConceptDatasetExecutionRequest()
        {

        }

        public ConceptDatasetExecutionRequest(QueryRef qr, IPanelItemDTO panelItem, long? early = null, long? late = null)
        {
            QueryRef = qr;
            PanelItem = panelItem;
            if (early.HasValue)
            {
                EarlyBound = DateTimes.FromUTCTicks(early.Value);
            }
            if (late.HasValue)
            {
                LateBound = DateTimes.FromUTCTicks(late.Value);
            }
        }
    }
}
