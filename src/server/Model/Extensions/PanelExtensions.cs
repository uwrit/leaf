// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;
using System.Linq;
using Model.Tagging;

namespace Model.Extensions
{
    public static class PanelExtensions
    {
        public static HashSet<Guid> GetConceptIds(this IEnumerable<Panel> panels)
        {
            return panels
                .SelectMany(p => p.SubPanels)
                .SelectMany(s => s.PanelItems)
                .Select(i => i.Concept.Id)
                .ToHashSet();
        }

        public static HashSet<Urn> GetConceptUniversalIds(this IEnumerable<Panel> panels)
        {
            return panels
                .SelectMany(p => p.SubPanels)
                .SelectMany(s => s.PanelItems)
                .Select(i => i.Concept.UniversalId)
                .ToHashSet(new UrnEqualityComparer());
        }

        public static IEnumerable<Concept> GetConcepts(this IEnumerable<Panel> panels)
        {
            return panels
                .SelectMany(p => p.SubPanels)
                .SelectMany(s => s.PanelItems)
                .Select(i => i.Concept);
        }

        public static ResourceRefs GetResources(this IEnumerable<Panel> panels)
        {
            var items = panels
                .SelectMany(p => p.SubPanels)
                .SelectMany(s => s.PanelItems);

            return new ResourceRefs(items
                .Where(i => i.Concept.Id != Guid.Empty)
                .Select(i => new ResourceRef { Id = i.Concept.Id, UniversalId = i.Concept.UniversalId?.ToString() }));
        }
    }
}
