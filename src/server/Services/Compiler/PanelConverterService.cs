// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using DTO.Compiler;
using System.Security.Claims;
using Services.Authorization;
using Services.Compiler;
using Services.Extensions;
using Model.Compiler;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Options;
using DTO.Cohort;
using Model.Authorization;
using Model.Extensions;
using Model.Tagging;

/*
 * This is the main point of conversion for all embeddable resources.
 * Regardless of the fact that resource references come in, only concepts are allowed out.
 * This probably means there is a substantial refactor of this implementation ahead.
 * 
 * Steps:
 * 1. write the bucketing code for digesting an enumerable of resourcerefs.
 *    a. if UseUniversalId == false, must be assumed to be a concept.
 *    b. pass to Urn.TryParse and assess output type.
 * 
 */

namespace Services.Compiler
{
    using LocalConceptMap = Dictionary<Guid, Concept>;
    using FederatedConceptMap = Dictionary<string, Concept>;

    public class PanelConverterService : IPanelConverterService
    {
        readonly IUserContext user;
        readonly IPreflightResourceReader preflightReader;
        readonly ILogger<PanelConverterService> log;
        readonly CompilerOptions compilerOptions;
        readonly AppDbOptions appDbOptions;

        public PanelConverterService(
            IPreflightResourceReader preflightConceptReader,
            IUserContext userContext,
            IOptions<CompilerOptions> compilerOptions,
            IOptions<AppDbOptions> appDbOptions,
            ILogger<PanelConverterService> logger)
        {
            preflightReader = preflightConceptReader;
            user = userContext;
            this.compilerOptions = compilerOptions.Value;
            this.appDbOptions = appDbOptions.Value;
            log = logger;
        }

        public async Task<PanelValidationContext> GetPanelsAsync(PatientCountQueryDTO query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            var validationContext = await GetPanelsAsync(query);
            validationContext.SetQueryId(query.QueryId);
            return validationContext;
        }

        public async Task<PanelValidationContext> GetPanelsAsync(QuerySaveDTO query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            var validationContext = await GetPanelsAsync(query);
            validationContext.SetUniversalId(query.UniversalId);
            return validationContext;
        }

        public async Task<PanelValidationContext> GetPanelsAsync(IQueryDefinition query)
        {
            var resources = await GetPreflightResourcesAsync(query.All);

            if (!resources.Ok)
            {
                log.LogInformation("Preflight Check Failed. Query:{@Query} Preflight:{@Preflight}", query, resources);
                return new PanelValidationContext(query, resources);
            }

            var concepts = resources.Concepts(compilerOptions);

            var panels = GetPanels(query.All, concepts);

            return new PanelValidationContext(query, resources, panels);
        }

        // TODO(cspital) extract to own impl with no DTO dependencies?
        public QueryDefinitionDTO LocalizeDefinition(IQueryDefinition definition, PatientCountQuery localQuery)
        {
            var local = new QueryDefinitionDTO { Panels = definition.Panels, PanelFilters = definition.PanelFilters };
            if (user.IsInstutional)
            {
                return local;
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
                    filter.Concept = new ConceptRefDTO { Id = replFilterConcept.Id, UniversalId = replFilterConcept.UniversalId };
                }
            }

            return local;
        }

        async Task<PreflightResources> GetPreflightResourcesAsync(IEnumerable<PanelDTO> panels)
        {
            var requested = panels.SelectMany(p => p.SubPanels)
                                  .SelectMany(s => s.PanelItems)
                                  .Select(i => i.Resource);
            var resources = new ResourceRefs(requested);

            return await preflightReader.GetAsync(resources);
        }

        IEnumerable<Panel> GetPanels(IEnumerable<PanelDTO> panels, IEnumerable<Concept> concepts)
        {
            if (user.IsInstutional)
            {
                var local = concepts.ToDictionary(c => c.Id);
                return GetPanels(panels, local);
            }
            var feder = concepts.ToDictionary(c => c.UniversalId.ToString());
            return GetPanels(panels, feder);
        }

        IEnumerable<Panel> GetPanels(IEnumerable<PanelDTO> panels, LocalConceptMap concepts)
        {
            var converted = new List<Panel>();

            foreach (var paneldto in panels)
            {
                var subs = GetSubPanels(paneldto.SubPanels, concepts);
                converted.Add(paneldto.ToModel(subs));
            }

            return converted;
        }

        ICollection<SubPanel> GetSubPanels(IEnumerable<SubPanelDTO> dtos, LocalConceptMap concepts)
        {
            var subs = new List<SubPanel>();

            foreach (var subdto in dtos)
            {
                var items = GetPanelItems(subdto.PanelItems, concepts);
                var sub = subdto.ToModel(items);
                subs.Add(sub);
            }

            return subs;
        }

        IEnumerable<PanelItem> GetPanelItems(IEnumerable<PanelItemDTO> dtos, LocalConceptMap concepts)
        {
            var items = new List<PanelItem>();

            foreach (var itemdto in dtos)
            {
                var item = itemdto.ToModel(concepts[itemdto.Resource.Id.Value]);
                items.Add(item);
            }

            return items;
        }

        IEnumerable<Panel> GetPanels(IEnumerable<PanelDTO> panels, FederatedConceptMap concepts)
        {
            var converted = new List<Panel>();

            foreach (var paneldto in panels)
            {
                var subs = GetSubPanels(paneldto.SubPanels, concepts);
                converted.Add(paneldto.ToModel(subs));
            }

            return converted;
        }

        ICollection<SubPanel> GetSubPanels(IEnumerable<SubPanelDTO> dtos, FederatedConceptMap concepts)
        {
            var subs = new List<SubPanel>();

            foreach (var subdto in dtos)
            {
                var items = GetPanelItems(subdto.PanelItems, concepts);
                var sub = subdto.ToModel(items);
                subs.Add(sub);
            }

            return subs;
        }

        IEnumerable<PanelItem> GetPanelItems(IEnumerable<PanelItemDTO> dtos, FederatedConceptMap concepts)
        {
            var items = new List<PanelItem>();

            foreach (var itemdto in dtos)
            {
                var item = itemdto.ToModel(concepts[itemdto.Resource.UniversalId]);
                items.Add(item);
            }

            return items;
        }
    }
}
