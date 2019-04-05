// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class CteCohortQueryContext
    {
        public Panel Panel { get; set; }
        public string CompiledQuery { get; set; }

        public bool IsInclusion => Panel.IncludePanel;

        int? estimatedCount;
        public int? GetEstimatedCount()
        {
            if (estimatedCount.HasValue)
            {
                return estimatedCount;
            }

            var concepts = Panel.SubPanels
                                .SelectMany(s => s.PanelItems)
                                .Select(i => i.Concept);

            if (Panel.IsDateFiltered)
            {
                var years = GetYears(Panel.DateFilter);

                var encounterBased = concepts.Where(c => c.IsEncounterBased && c.UiDisplayPatientCountByYear != null)
                                             .SelectMany(c => c.UiDisplayPatientCountByYear)
                                             .Where(y => y != null && years.Contains(y.Year))
                                             .Sum(count => count.PatientCount);

                var notEncounterBased = concepts.Where(c => !c.IsEncounterBased && c.UiDisplayPatientCountByYear != null)
                                                .Sum(c => c.UiDisplayPatientCount.Value);

                estimatedCount = encounterBased + notEncounterBased;
            }
            else
            {
                estimatedCount = concepts.Where(c => c.UiDisplayPatientCount.HasValue)
                                         .Sum(c => c.UiDisplayPatientCount.Value);
            }

            return estimatedCount;
        }

        IEnumerable<int> GetYears(DateBoundary boundary)
        {
            var start = boundary.Start.Date.Year;
            var end = boundary.End.Date.Year;

            return Enumerable.Range(start, end - start + 1);
        }
    }
}
