// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
        readonly ICachedCohortPreparer cohortPreparer;

        public PanelConverter(
            PreflightResourceChecker preflightSearch,
            IUserContextProvider userContextProvider,
            IOptions<CompilerOptions> compilerOptions,
            ICachedCohortPreparer cohortPreparer,
            ILogger<PanelConverter> logger)
        {
            this.user = userContextProvider.GetUserContext();
            this.preflightSearch = preflightSearch;
            this.compilerOptions = compilerOptions.Value;
            this.cohortPreparer = cohortPreparer;
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
        /// The returned AST is unvalidated, and has a UniversalId property set if the incoming query has one.
        /// </summary>
        /// <returns>The panels async.</returns>
        /// <param name="query">Stub AST query definition.</param>
        /// <param name="token">Cancellation token.</param>
        public async Task<PanelValidationContext> GetPanelsAsync(IConceptDatasetPanel query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            var validationContext = await GetPanelsAsync(query);
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

            var concepts = await resources.Concepts(compilerOptions, cohortPreparer);
            var crosswalk = CrosswalkImportIds(query.All(), resources.DirectImportsCheck.Results.Select(r => r.ImportRef));
            var panels = GetPanels(crosswalk, concepts);
            var merged = MergeFilters(panels, resources.GlobalPanelFilters);

            return new PanelValidationContext(query, resources, merged);
        }

        /// <summary>
        /// Crosswalks panel items to associated import dataset reference ids.
        /// The returned AST is unvalidated.
        /// </summary>
        /// <returns>The panels.</returns>
        /// <param name="panels">PanelDTOs.</param>
        /// <param name="importRefs">Import panel items referenced in panels.</param>
        public static IEnumerable<IPanelDTO> CrosswalkImportIds(IEnumerable<IPanelDTO> panels, IEnumerable<ImportRef> importRefs)
        {
            var mapped = panels.Select(p => p).ToList();

            foreach (var @ref in importRefs)
            {
                var map = mapped
                    .SelectMany(p => p.SubPanels
                    .SelectMany(sp => sp.PanelItems
                    .Where(pi => pi.Resource.UniversalId == @ref.UniversalId.ToString())));
                foreach (var panelItem in map)
                {
                    panelItem.Resource.Id = @ref.Id;
                }
            }
            return mapped;
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
                                .Select(c =>
                                    new KeyValuePair<string, ResourceRef>(
                                        key: c.UniversalId.ToString(),
                                        value: new ResourceRef { Id = c.Id, UniversalId = c.UniversalId.ToString() })
                                    )
                                );

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
                var panel = new Panel()  { Domain = PanelDomain.GlobalPanelFilter, IncludePanel = global.IsInclusion, SubPanels = new[] { sub }, Index = lastPanelIndex };

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

        static IEnumerable<Panel> GetPanels(IEnumerable<IPanelDTO> panels, LocalConceptMap concepts)
        {
            var converted = new List<Panel>();

            foreach (var paneldto in panels)
            {
                var subs = GetSubPanels(paneldto.SubPanels, concepts);
                converted.Add(paneldto.Panel(subs));
            }

            return converted;
        }

        static ICollection<SubPanel> GetSubPanels(IEnumerable<ISubPanelDTO> dtos, LocalConceptMap concepts)
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

        static IEnumerable<PanelItem> GetPanelItems(IEnumerable<IPanelItemDTO> dtos, LocalConceptMap concepts)
        {
            var items = new List<PanelItem>();

            foreach (var itemdto in dtos)
            {
                var item = itemdto.PanelItem(concepts[itemdto.Resource.Id.Value]);
                items.Add(item);
            }

            return items;
        }

        static IEnumerable<Panel> GetPanels(IEnumerable<IPanelDTO> panels, FederatedConceptMap concepts)
        {
            var converted = new List<Panel>();

            foreach (var paneldto in panels)
            {
                var subs = GetSubPanels(paneldto.SubPanels, concepts);
                converted.Add(paneldto.Panel(subs));
            }

            return converted;
        }

        static ICollection<SubPanel> GetSubPanels(IEnumerable<ISubPanelDTO> dtos, FederatedConceptMap concepts)
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

        static IEnumerable<PanelItem> GetPanelItems(IEnumerable<IPanelItemDTO> dtos, FederatedConceptMap concepts)
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
