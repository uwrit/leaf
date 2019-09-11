// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Extensions;
using Model.Options;
using Model.Search;

/*
 * This is the main point of conversion for all embeddable resources.
 * Regardless of the fact that resource references come in, only concepts are allowed out.
 * This probably means there is a substantial refactor of this implementation ahead.
 */

namespace Model.Compiler
{
    using FederatedConceptMap = Dictionary<string, Concept>;
    using LocalConceptMap = Dictionary<Guid, Concept>;

    /// <summary>
    /// Encapsulates Leaf's workflow for converting stub AST to fully hydrated AST, as well as localizing federated query definition.
    /// </summary>
    public class PanelConverter
    {
        readonly IUserContext user;
        readonly PreflightResourceChecker preflightSearch;
        readonly ILogger<PanelConverter> log;
        readonly CompilerOptions compilerOptions;

        public PanelConverter(
            PreflightResourceChecker preflightSearch,
            IUserContext userContext,
            IOptions<CompilerOptions> compilerOptions,
            ILogger<PanelConverter> logger)
        {
            this.preflightSearch = preflightSearch;
            user = userContext;
            this.compilerOptions = compilerOptions.Value;
            log = logger;
        }

        /// <summary>
        /// Converts stub AST query definition into local, fully hydrated AST.
        /// The returned AST is unvalidated, and has a QueryId property set if the incoming query has one.
        /// </summary>
        /// <returns>The panels async.</returns>
        /// <param name="query">Stub AST query definition.</param>
        /// <param name="token">Cancellation token.</param>
        public async Task<PanelValidationContext> GetPanelsAsync(IPatientCountQueryDTO query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            var validationContext = await GetPanelsAsync(query);
            validationContext.SetQueryId(query.QueryId);
            return validationContext;
        }

        /// <summary>
        /// Converts stub AST query definition into local, fully hydrated AST.
        /// The returned AST is unvalidated, and has a UniversalId property set if the incoming query has one.
        /// </summary>
        /// <returns>The panels async.</returns>
        /// <param name="query">Stub AST query definition.</param>
        /// <param name="token">Cancellation token.</param>
        public async Task<PanelValidationContext> GetPanelsAsync(IQuerySaveDTO query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            var validationContext = await GetPanelsAsync(query);
            validationContext.SetUniversalId(query.UniversalId);
            return validationContext;
        }

        /// <summary>
        /// Converts stub AST query definition into local, fully hydrated AST.
        /// The returned AST is unvalidated.
        /// </summary>
        /// <returns>The panels async.</returns>
        /// <param name="query">Stub AST query definition.</param>
        public async Task<PanelValidationContext> GetPanelsAsync(IQueryDefinition query)
        {
            var resources = await GetPreflightResourcesAsync(query.All());

            if (!resources.Ok)
            {
                log.LogInformation("Preflight Check Failed. Query:{@Query} Preflight:{@Preflight}", query, resources);
                return new PanelValidationContext(query, resources);
            }

            var concepts = resources.Concepts(compilerOptions);
            var panels = GetPanels(query.All(), concepts);
            var merged = MergeFilters(panels, resources.GlobalPanelFilters);

            return new PanelValidationContext(query, resources, merged);
        }

        /// <summary>
        /// Overwrites the <paramref name="definition"/> resource references to local references from <paramref name="localQuery"/>.
        /// </summary>
        /// <param name="definition">Stub AST query definition.</param>
        /// <param name="localQuery">Local query.</param>
        public void LocalizeDefinition(IQueryDefinition definition, PatientCountQuery localQuery)
        {
            if (user.IsInstitutional)
            {
                return;
            }

            var map = new Dictionary<string, ResourceRef>(localQuery.Panels
                                .GetConcepts()
                                .Select(c => new KeyValuePair<string, ResourceRef>(key: c.UniversalId.ToString(), value: new ResourceRef { Id = c.Id, UniversalId = c.UniversalId.ToString() })));

            var items = definition.Panels
                .SelectMany(p => p.SubPanels)
                .SelectMany(s => s.PanelItems);

            foreach (var item in items)
            {
                var name = item.Resource?.UiDisplayName;
                if (map.TryGetValue(item.Resource.UniversalId, out var repl))
                {
                    item.Resource = new ResourceRef { Id = repl.Id, UniversalId = repl.UniversalId, UiDisplayName = name };
                }
            }

            foreach (var filter in definition.PanelFilters)
            {
                if (map.TryGetValue(filter.Concept.UniversalId, out var replFilterConcept))
                {
                    filter.Concept = replFilterConcept;
                }
            }
        }

        async Task<PreflightResources> GetPreflightResourcesAsync(IEnumerable<IPanelDTO> panels)
        {
            var requested = panels.SelectMany(p => p.SubPanels)
                                  .SelectMany(s => s.PanelItems)
                                  .Select(i => i.Resource);
            var resources = new ResourceRefs(requested);

            return await preflightSearch.GetResourcesAsync(resources);
        }

        public static IEnumerable<Panel> MergeFilters(IEnumerable<Panel> panels, IEnumerable<GlobalPanelFilter> globalPanelFilters)
        {
            var lastPanelIndex = panels.Max(p => p.Index);
            var merge = new List<Panel>();
            merge.AddRange(panels);

            for (int i = 0; i < globalPanelFilters.Count(); i++)
            {
                lastPanelIndex += i + 1;

                var global = globalPanelFilters.ElementAt(i);
                var pi = new PanelItem() { Concept = global.ToConcept() };
                var sub = new SubPanel() { IncludeSubPanel = true, PanelItems = new[] { pi } };
                var panel = new Panel() { IncludePanel = global.IsInclusion, SubPanels = new[] { sub } };

                merge.Add(panel);
            }
            return merge;
        }

        IEnumerable<Panel> GetPanels(IEnumerable<IPanelDTO> panels, IEnumerable<Concept> concepts)
        {
            if (user.IsInstitutional)
            {
                var local = concepts.ToDictionary(c => c.Id);
                return GetPanels(panels, local);
            }
            var feder = concepts.ToDictionary(c => c.UniversalId.ToString());
            return GetPanels(panels, feder);
        }

        IEnumerable<Panel> GetPanels(IEnumerable<IPanelDTO> panels, LocalConceptMap concepts)
        {
            var converted = new List<Panel>();

            foreach (var paneldto in panels)
            {
                var subs = GetSubPanels(paneldto.SubPanels, concepts);
                converted.Add(paneldto.Panel(subs));
            }

            return converted;
        }

        ICollection<SubPanel> GetSubPanels(IEnumerable<ISubPanelDTO> dtos, LocalConceptMap concepts)
        {
            var subs = new List<SubPanel>();

            foreach (var subdto in dtos)
            {
                var items = GetPanelItems(subdto.PanelItems, concepts);
                var sub = subdto.SubPanel(items);
                subs.Add(sub);
            }

            return subs;
        }

        IEnumerable<PanelItem> GetPanelItems(IEnumerable<IPanelItemDTO> dtos, LocalConceptMap concepts)
        {
            var items = new List<PanelItem>();

            foreach (var itemdto in dtos)
            {
                var item = itemdto.PanelItem(concepts[itemdto.Resource.Id.Value]);
                items.Add(item);
            }

            return items;
        }

        IEnumerable<Panel> GetPanels(IEnumerable<IPanelDTO> panels, FederatedConceptMap concepts)
        {
            var converted = new List<Panel>();

            foreach (var paneldto in panels)
            {
                var subs = GetSubPanels(paneldto.SubPanels, concepts);
                converted.Add(paneldto.Panel(subs));
            }

            return converted;
        }

        ICollection<SubPanel> GetSubPanels(IEnumerable<ISubPanelDTO> dtos, FederatedConceptMap concepts)
        {
            var subs = new List<SubPanel>();

            foreach (var subdto in dtos)
            {
                var items = GetPanelItems(subdto.PanelItems, concepts);
                var sub = subdto.SubPanel(items);
                subs.Add(sub);
            }

            return subs;
        }

        IEnumerable<PanelItem> GetPanelItems(IEnumerable<IPanelItemDTO> dtos, FederatedConceptMap concepts)
        {
            var items = new List<PanelItem>();

            foreach (var itemdto in dtos)
            {
                var item = itemdto.PanelItem(concepts[itemdto.Resource.UniversalId]);
                items.Add(item);
            }

            return items;
        }
    }
}
