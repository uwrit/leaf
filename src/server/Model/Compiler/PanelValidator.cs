// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace Model.Compiler
{
    using PanelItemMapping = Tuple<IPanelItemDTO, PanelItem>;

    /// <summary>
    /// Panel validator.
    /// </summary>
    public class PanelValidator
    {
        readonly ILogger<PanelValidator> log;

        public PanelValidator(ILogger<PanelValidator> logger)
        {
            log = logger;
        }

        /// <summary>
        /// Validate the specified context. Throws if there are unrecoverable errors.
        /// </summary>
        /// <returns>The validated PatientCountQuery.</returns>
        /// <param name="ctx">Context.</param>
        /// <exception cref="LeafCompilerException"/>
        public PatientCountQuery Validate(PanelValidationContext ctx)
        {
            if (!ctx.PreflightPassed)
            {
                throw new LeafCompilerException("PreflightCheck failed, nothing to validate.");
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
                        throw new LeafCompilerException($"End date precedes start.");
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
                                                  .Where(s => s.Id == d.Id || (d.UniversalId != null && s.UniversalId.ToString() == d.UniversalId))
                           };
                       });

            foreach (var spec in join)
            {
                if (spec.matches.Count() != 1)
                {
                    var message = $"SpecializationId: {spec.specialization.Id} or UniversalId: {spec.specialization.UniversalId} invalid";
                    log.LogWarning("Specialization Misalignment: {Message}. Payload:{@Payload}", message, mapping.Item1);
                    throw new LeafCompilerException($"Specialization Misalignment: {message}.");
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
                log.LogWarning("Recency Filter Misalignment: No Recency Type Selected. Payload:{@Payload}", mapping.Item1);
                throw new LeafCompilerException($"Recency Filter Misalignment: No Recency Type Selected.");
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
                    log.LogWarning("Numeric Filter Misalignment: Not enough arguments for NumericFilterType:{Type}. Payload:{@Payload}", filter.FilterType.ToString(), mapping.Item1);
                    throw new LeafCompilerException($"Numeric Filter Misalignment: Missing Numeric Arguments.");
                }

                if (actual > expected)
                {
                    log.LogWarning("Numeric Filter Misalignment: Too many arguments for NumericFilterType:{Type}. Payload:{@Payload}", filter.FilterType.ToString(), mapping.Item1);
                    throw new LeafCompilerException($"Numeric Filter Misalignment: Excessive Numeric Arguments.");
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
