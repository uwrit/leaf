﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Extensions;

namespace Model.Compiler
{
    public class DatasetExecutionRequest
    {
        public QueryRef QueryRef { get; set; }
        public DatasetQueryRef DatasetRef { get; set; }
        public DateTime? EarlyBound { get; set; }
        public DateTime? LateBound { get; set; }
        public int? PanelIndex { get; set; }

        public DatasetExecutionRequest()
        {

        }

        public DatasetExecutionRequest(QueryRef qr, DatasetQueryRef dr, long? early = null, long? late = null, int? panelIdx = null)
        {
            QueryRef = qr;
            DatasetRef = dr;
            if (early.HasValue)
            {
                EarlyBound = DateTimes.FromUTCTicks(early.Value);
            }
            if (late.HasValue)
            {
                LateBound = DateTimes.FromUTCTicks(late.Value);
            }
            if (panelIdx.HasValue)
            {
                PanelIndex = panelIdx;
            }
        }
    }
}
