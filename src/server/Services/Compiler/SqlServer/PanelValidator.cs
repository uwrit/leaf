// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using DTO.Compiler;
using Model.Compiler;
using Model.Cohort;
using Services.Authorization;
using Services.Extensions;
using System.Security.Claims;
using System.Linq;
using Newtonsoft.Json;
using Model.Authorization;

namespace Services.Compiler.SqlServer
{
    using PanelItemMapping = Tuple<PanelItemDTO, PanelItem>;

    public class SqlServerPanelValidator : IPanelValidator
    {
        readonly IUserContext user;
        readonly ILogger<SqlServerPanelValidator> log;

        public SqlServerPanelValidator(IUserContext userContext,
                              ILogger<SqlServerPanelValidator> logger)
        {
            user = userContext;
            log = logger;
        }

        public PatientCountQuery Validate(PanelValidationContext ctx)
        {
            if (!ctx.PreflightPassed)
            {
                throw new InvalidOperationException("PreflightCheck failed, nothing to validate.");
            }
            ValidateItems(ctx);
            var panels = ValidatePanels(ctx);
            return new PatientCountQuery
            {
                QueryId = ctx.QueryId,
                Panels = panels
            };
        }

        IReadOnlyCollection<Panel> ValidatePanels(PanelValidationContext ctx)
        {
            var validated = new List<Panel>();
            foreach (var panel in ctx.Allowed)
            {
                var itemCount = panel.SubPanels.SelectMany(x => x.PanelItems).Count();
                if (itemCount == 0)
                {
                    continue;
                }

                CheckDateFilter(panel);

                var validatedSubs = new List<SubPanel>();
                foreach (var subpanel in panel.SubPanels)
                {
                    if (subpanel.PanelItems.Any())
                    {
                        subpanel.PanelIndex = panel.Index;
                        foreach (var panelItem in subpanel.PanelItems)
                        {
                            panelItem.SubPanelIndex = subpanel.Index;
                            panelItem.PanelIndex = panel.Index;
                        }
                        validatedSubs.Add(subpanel);
                    }
                }
                panel.SubPanels = validatedSubs;

                validated.Add(panel);
            }

            return validated;
        }

        void CheckDateFilter(Panel panel)
        {
            if (!panel.IsDateFiltered)
            {
                return;
            }

            var start = panel.DateFilter.Start;
            var end = panel.DateFilter.End;

            if (panel.DateFilter.Start.DateIncrementType == DateIncrementType.Specific)
            {
                if (end.DateIncrementType == DateIncrementType.Specific)
                {
                    if (start.Date.CompareTo(end.Date) > 0)
                    {
                        throw new InvalidOperationException($"End date precedes start.");
                    }
                }
            }
        }

        void ValidateItems(PanelValidationContext ctx)
        {
            var zipped = ZipContextItems(ctx);

            foreach (var mapping in zipped)
            {
                EnsureSpecializationAlignment(mapping);
                EnsureValidRecencyFilter(mapping);
                EnsureValidNumericFilter(mapping);
            }
        }

        void EnsureSpecializationAlignment(PanelItemMapping mapping)
        {
            var dto = mapping.Item1;
            var panelItem = mapping.Item2;
            if (!panelItem.HasSpecializations)
            {
                return;
            }

            var join = dto.Specializations
                       .Select(d =>
                       {
                           return new
                           {
                               specialization = d,
                               matches = panelItem.Concept.SpecializationGroups
                                                  .SelectMany(s => s.Specializations)
                                                  .Where(s => s.Id == d.Id || d.UniversalId != null && s.UniversalId.ToString() == d.UniversalId)
                           };
                       });

            foreach (var spec in join)
            {
                if (spec.matches.Count() != 1)
                {
                    var message = $"SpecializationId: {spec.specialization.Id} or UniversalId: {spec.specialization.UniversalId} invalid";
                    log.LogWarning("Specialization Misalignment: {Message}. Payload:{Payload}", message, mapping.Item1);
                    throw new InvalidOperationException($"Specialization Misalignment: {message}.");
                }
            }
        }

        void EnsureValidRecencyFilter(PanelItemMapping mapping)
        {
            var item = mapping.Item2;
            if (!item.UseRecencyFilter)
            {
                return;
            }

            if (item.RecencyFilter == RecencyFilterType.None)
            {
                log.LogWarning("Recency Filter Misalignment: No Recency Type Selected. Payload:{Payload}", mapping.Item1);
                throw new InvalidOperationException($"Recency Filter Misalignment: No Recency Type Selected.");
            }
        }

        void EnsureValidNumericFilter(PanelItemMapping mapping)
        {
            var item = mapping.Item2;
            if (!item.UseNumericFilter)
            {
                return;
            }
            var filter = item.NumericFilter;

            void throwIfNotLength(int expected)
            {
                var actual = filter.Filter.Length;
                if (actual < expected)
                {
                    log.LogWarning("Numeric Filter Misalignment: Not enough arguments for NumericFilterType:{Type}. Payload:{Payload}", filter.FilterType.ToString(), mapping.Item1);
                    throw new InvalidOperationException($"Numeric Filter Misalignment: Missing Numeric Arguments.");
                }

                if (actual > expected)
                {
                    log.LogWarning("Numeric Filter Misalignment: Too many arguments for NumericFilterType:{Type}. Payload:{Payload}", filter.FilterType.ToString(), mapping.Item1);
                    throw new InvalidOperationException($"Numeric Filter Misalignment: Excessive Numeric Arguments.");
                }
            }

            switch (filter.FilterType)
            {
                case NumericFilterType.EqualTo:
                case NumericFilterType.GreaterThan:
                case NumericFilterType.GreaterThanOrEqualTo:
                case NumericFilterType.LessThan:
                case NumericFilterType.LessThanOrEqualTo:
                    throwIfNotLength(1);
                    return;
                case NumericFilterType.Between:
                    throwIfNotLength(2);
                    return;
            }
        }

        // NOTE(cspital) at this point, we are certain the counts are the same.
        IEnumerable<PanelItemMapping> ZipContextItems(PanelValidationContext ctx)
        {
            var dtos = ctx.Requested
                          .SelectMany(p => p.SubPanels)
                          .SelectMany(s => s.PanelItems)
                          .ToArray();

            var mods = ctx.Allowed
                          .SelectMany(p => p.SubPanels)
                          .SelectMany(s => s.PanelItems)
                          .ToArray();

            return dtos.Zip(mods, (dto, mod) => new PanelItemMapping(dto, mod));
        }
    }
}
