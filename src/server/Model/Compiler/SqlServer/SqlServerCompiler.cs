// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Options;
using Model.Extensions;
using Model.Options;

namespace Model.Compiler.SqlServer
{
    public class SqlServerCompiler : ISqlCompiler
    {
        readonly CompilerOptions compilerOptions;
        readonly CohortOptions cohortOptions;

        public SqlServerCompiler(
            IOptions<CompilerOptions> compilerOptions,
            IOptions<CohortOptions> cohortOptions)
        {
            this.compilerOptions = compilerOptions.Value;
            this.cohortOptions = cohortOptions.Value;
        }

        /// <summary>
        /// Builds the SQL statement for the given Panel
        /// </summary>
        /// <returns>The panel sql.</returns>
        /// <param name="panel">Panel.</param>
        public string BuildPanelSql(Panel panel)
        {
            switch (panel.PanelType)
            {
                case PanelType.Patient:
                    return BuildPersonPanelSql(panel, true);
                case PanelType.Sequence:
                    return BuildSequentialPanelSql(panel, true);
                default:
                    return string.Empty;
            }
        }

        public ISqlStatement BuildCteSql(IEnumerable<Panel> panels)
        {
            var contexts = panels.Select((p, i) =>
            {
                return new CteCohortQueryContext
                {
                    Panel = p,
                    CompiledQuery = BuildWrappedPanelSql(p, i)
                };
            });

            var (inclusions, exclusions) = contexts.PartitionBy(c => c.IsInclusion)
                                                   .OrderBy(c => c.GetEstimatedCount());

            var query = new StringBuilder(inclusions.First().CompiledQuery);

            foreach (var context in inclusions.Skip(1))
            {
                query.Append($" {Dialect.SQL_INTERSECT} {context.CompiledQuery}");
            }

            foreach (var context in exclusions)
            {
                query.Append($" {Dialect.SQL_EXCEPT} {context.CompiledQuery}");
            }

            return new CteCohortQuery(query.ToString());
        }

        string BuildWrappedPanelSql(Panel panel, int index)
        {
            var internals = BuildPanelSql(panel);
            var alias = $"P{index}";
            return $"SELECT {alias}.{compilerOptions.FieldPersonId} FROM ( {internals} ) AS {alias}";
        }

        string BuildPersonPanelSql(Panel panel, bool showPersonId)
        {
            var sqlBuilder = new StringBuilder();
            var fieldPersonId = compilerOptions.FieldPersonId;
            var totalItems = panel.SubPanels.ElementAt(0).PanelItems.Count();
            var showType = !showPersonId;

            for (var k = 0; k < totalItems; k++)
            {
                var sub = panel.SubPanels.ElementAt(0);
                var itemConfig = new PanelItemContext
                {
                    PanelItem = sub.PanelItems.ElementAt(k),
                    SubPanelHasNonEncounter = false,
                    TargetColumn = fieldPersonId,
                    FilterDate = panel.IsDateFiltered,
                    FilterCount = sub.HasCountFilter,
                    MinCount = sub.MinimumCount,
                    DateStart = panel.DateFilter?.Start,
                    DateStop = panel.DateFilter?.End,
                    IsSequential = false,
                    IsExists = showType,
                    ExistsParentAlias = Dialect.ALIAS_PERSON,
                    ExistsJoinColumn = fieldPersonId
                };

                var itemSql = BuildPanelItemSql(itemConfig);
                sqlBuilder.Append(itemSql);

                if ((k + 1) < totalItems && totalItems > 1)
                {
                    sqlBuilder.Append(Dialect.SQL_SPACE + Dialect.SQL_UNION_ALL + Dialect.SQL_SPACE);
                }
            }

            var sql = sqlBuilder.ToString();
            ValidateSql(sql);

            return sql;
        }

        string BuildSequentialPanelSql(Panel panel, bool showPersonId)
        {
            var firstSubpanelIndex = panel.SubPanels.ElementAt(0).Index;
            var panelSql = new StringBuilder();
            var outputColumn = showPersonId ? $"{Dialect.ALIAS_SUBQUERY}{firstSubpanelIndex}.{compilerOptions.FieldPersonId} " : "1 ";

            // SELECT ...
            // FROM ...
            panelSql.Append($"{Dialect.SQL_SELECT} {outputColumn}" +
                            $"{Dialect.SQL_FROM} ");

            bool hasAnchorDate = false;
            bool isAnchorDate = false;
            string anchorDate = string.Empty;

            for (int k = 0; k < panel.SubPanels.Count; k++)
            {
                string nonEncounterJoinLogic = string.Empty;
                string nonEventJoinLogic = string.Empty;
                SubPanel subPanel = panel.SubPanels.ElementAt(k);
                var firstItem = subPanel.PanelItems.ElementAt(0);
                isAnchorDate = false;

                if (!hasAnchorDate)
                {
                    // In order to have a base date to join on later in the sequence,
                    // track the first included subpanel date field.
                    if (subPanel.JoinSequence.SequenceType != SequenceType.PlusMinus && subPanel.IncludeSubPanel)
                    {
                        hasAnchorDate = true;
                        isAnchorDate = true;
                        anchorDate = PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", subPanel.PanelItems.ElementAt(0).Concept.SqlFieldDate);
                    }
                }
                else
                {
                    if (subPanel.IncludeSubPanel && subPanel.JoinSequence.SequenceType == SequenceType.WithinFollowing)
                    {
                        anchorDate = $"DATEADD({subPanel.JoinSequence.DateIncrementType.ToString()}, {subPanel.JoinSequence.Increment}, {anchorDate})";
                    }
                }

                // JOIN ...
                if (k > 0)
                {
                    panelSql.Append(" " + (subPanel.IncludeSubPanel ? Dialect.SQL_INNER_JOIN : Dialect.SQL_LEFT_JOIN) + Dialect.SQL_SPACE);
                }
                panelSql.Append("(");

                for (int j = 0; j < subPanel.PanelItems.Count(); j++)
                {
                    var itemConfig = new PanelItemContext
                    {
                        PanelItem = subPanel.PanelItems.ElementAt(j),
                        SubPanelHasNonEncounter = subPanel.HasNonEncounter,
                        TargetColumn = compilerOptions.FieldPersonId,
                        FilterDate = panel.IsDateFiltered,
                        FilterCount = subPanel.HasCountFilter,
                        MinCount = subPanel.MinimumCount,
                        DateStart = panel.DateFilter?.Start,
                        DateStop = panel.DateFilter?.End,
                        IsSequential = true,
                        IsExists = false,
                        ExistsParentAlias = string.Empty,
                        ExistsJoinColumn = string.Empty
                    };

                    var itemSql = BuildPanelItemSql(itemConfig);
                    panelSql.Append(itemSql);

                    // Add UNION ALL if other panel items follow
                    if ((j + 1) < subPanel.PanelItems.Count())
                    {
                        panelSql.Append($" {Dialect.SQL_UNION_ALL} ");
                    }
                }

                if (k == 0)
                {
                    panelSql.Append($") AS {Dialect.ALIAS_SUBQUERY}{k} ");
                }
                else
                {
                    // ON A.PersonID = B.PersonID
                    panelSql.Append(") AS " +
                       $"{Dialect.ALIAS_SUBQUERY}{k} {Dialect.SQL_ON} {Dialect.ALIAS_SUBQUERY}{firstSubpanelIndex}.{compilerOptions.FieldPersonId} = " +
                       $"{Dialect.ALIAS_SUBQUERY}{k}.{compilerOptions.FieldPersonId} ");

                    panelSql.Append(Dialect.SQL_AND + " ");
                    var prevSub = panel.SubPanels.ElementAt(k - 1);

                    // If the previous SubPanel was Excluded, append "( ... additional logic ... )"
                    if (!prevSub.IncludeSubPanel)
                    {
                        panelSql.Append("(");
                    }

                    // If same encounter as previous SubPanel
                    if (subPanel.JoinSequence.SequenceType == SequenceType.Encounter)
                    {
                        // A0.EncounterID = A1.EncounterID
                        panelSql.Append($"{Dialect.ALIAS_SUBQUERY}{k - 1}.{compilerOptions.FieldEncounterId} = {Dialect.ALIAS_SUBQUERY}{k}.{compilerOptions.FieldEncounterId} {nonEncounterJoinLogic}");
                    }

                    // If same event as previous SubPanel
                    else if (subPanel.JoinSequence.SequenceType == SequenceType.Event)
                    {
                        // A0.EventId = A1.EventId
                        panelSql.Append(
                            $"{PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k - 1}", prevSub.PanelItems.ElementAt(0).Concept.SqlFieldEvent)} = " +
                            $"{PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", firstItem.Concept.SqlFieldEvent)} {nonEventJoinLogic} ");
                    }

                    // If +/- date in previous SubPanel
                    else if (subPanel.JoinSequence.SequenceType == SequenceType.PlusMinus)
                    {
                        panelSql.Append(
                            // (A1.DateField BETWEEN
                            $"({PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", firstItem.Concept.SqlFieldDate)} {Dialect.SQL_BETWEEN} " +
                            // DATEADD(MONTH, -1, A0.DateField
                            $"{Dialect.SQL_DATEADD}{subPanel.JoinSequence.DateIncrementType.ToString().ToUpper()}, -{subPanel.JoinSequence.Increment}, {PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k - 1}", prevSub.PanelItems.ElementAt(0).Concept.SqlFieldDate)}) " +
                            // AND
                            Dialect.SQL_AND +
                            // DATEADD(MONTH, 1, A0.DateField)
                            $"{Dialect.SQL_DATEADD}{subPanel.JoinSequence.DateIncrementType.ToString().ToUpper()}, {subPanel.JoinSequence.Increment}, {PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k - 1}", prevSub.PanelItems.ElementAt(0).Concept.SqlFieldDate)}) " +
                            $"{nonEncounterJoinLogic})");
                    }

                    // If follows within a range of previous SubPanel
                    else if (subPanel.JoinSequence.SequenceType == SequenceType.WithinFollowing)
                    {
                        panelSql.Append(
                            // (A1.DateField BETWEEN
                            $"({PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", firstItem.Concept.SqlFieldDate)} {Dialect.SQL_BETWEEN} " +
                            // A0.DateField
                            $"{PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k - 1}", prevSub.PanelItems.ElementAt(0).Concept.SqlFieldDate)} " +
                            // AND
                            Dialect.SQL_AND +
                            // DATEADD(MONTH, 1, A0.DateField)
                            $"{Dialect.SQL_DATEADD}{subPanel.JoinSequence.DateIncrementType.ToString().ToUpper()}, {subPanel.JoinSequence.Increment}, {PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k - 1}", prevSub.PanelItems.ElementAt(0).Concept.SqlFieldDate)}) " +
                            $"{nonEncounterJoinLogic})");
                    }

                    // If follows anytime of previous SubPanel
                    else if (subPanel.JoinSequence.SequenceType == SequenceType.AnytimeFollowing)
                    {
                        panelSql.Append(
                            // (A1.DateField >
                            $"({PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", firstItem.Concept.SqlFieldDate)} > " +
                            // A0.DateField)
                            $"{PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k - 1}", prevSub.PanelItems.ElementAt(0).Concept.SqlFieldDate)} " +
                            $"{nonEncounterJoinLogic})");
                    }

                    // If the previous SubPanel was Excluded
                    if (!prevSub.IncludeSubPanel)
                    {
                        // ) OR (A0.PersonId IS NULL
                        panelSql.Append($" {Dialect.SQL_OR} ({Dialect.ALIAS_SUBQUERY}{k - 1}.{compilerOptions.FieldPersonId} {Dialect.SQL_ISNULL} ");

                        if (hasAnchorDate && !isAnchorDate && subPanel.JoinSequence.SequenceType != SequenceType.Encounter)
                        {
                            // AND A1.DateField >
                            panelSql.Append($"{Dialect.SQL_AND} ({PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", firstItem.Concept.SqlFieldDate)} > " +
                                $"{anchorDate})");
                        }
                        panelSql.Append(")) ");
                    }
                }
            }

            // JOIN to parent SQL set
            if (!showPersonId)
            {
                panelSql.Append($"{Dialect.SQL_WHERE} {Dialect.ALIAS_PERSON}.{compilerOptions.FieldPersonId} = {Dialect.ALIAS_PERSON}{panel.Index}.{compilerOptions.FieldPersonId} ");
            }

            List<int> subPanelsWithHavingClause = (from s in panel.SubPanels
                                                   where !s.IncludeSubPanel || s.HasCountFilter
                                                   select s.Index).ToList();

            if (subPanelsWithHavingClause.Count > 0 || showPersonId)
            {
                // GROUP BY PersonId
                panelSql.Append($" {Dialect.SQL_GROUPBY} {Dialect.ALIAS_SUBQUERY}{firstSubpanelIndex}.{compilerOptions.FieldPersonId} ");

                if (subPanelsWithHavingClause.Count > 0)
                {
                    panelSql.Append($"HAVING ");

                    foreach (int k in subPanelsWithHavingClause)
                    {
                        SubPanel subPanel = panel.SubPanels.ElementAt(k);
                        string countDistinctDate = $"{Dialect.SQL_COUNT}DISTINCT {PrependSetAlias($"{Dialect.ALIAS_SUBQUERY}{k}", subPanel.PanelItems.ElementAt(0).Concept.SqlFieldDate)}) ";

                        // If SubPanel is Included and has a COUNT filter
                        if (subPanel.HasCountFilter && subPanel.IncludeSubPanel)
                        {
                            panelSql.Append($"{countDistinctDate} >= {subPanel.MinimumCount} ");
                        }
                        // If SubPanel is Excluded and has a COUNT filter
                        else if (subPanel.HasCountFilter && !subPanel.IncludeSubPanel)
                        {
                            panelSql.Append($"{countDistinctDate} < {subPanel.MinimumCount} ");
                        }
                        // If SubPanel is Excluded and does not have a COUNT Filter
                        else if (!subPanel.HasCountFilter && !subPanel.IncludeSubPanel)
                        {
                            panelSql.Append($"{countDistinctDate} = 0");
                        }

                        if (k < subPanelsWithHavingClause.Max())
                        {
                            panelSql.Append($"{Dialect.SQL_AND} ");
                        }
                    }
                }
            }

            return panelSql.ToString();
        }

        string BuildPanelItemSql(PanelItemContext ctx)
        {
            ctx.PanelItem.SqlRecencyFilter = GetRecencyFilter(ctx.PanelItem.RecencyFilter);
            var alias = GetJoiningAlias(ctx.TargetColumn);
            var itemAlias = $"_{alias}{ctx.PanelItem.PanelIndex}{ctx.PanelItem.SubPanelIndex}{ctx.PanelItem.Index}";
            var recencyAlias = ctx.PanelItem.UseRecencyFilter ? $"{itemAlias}_{ctx.PanelItem.SqlRecencyFilter.ToLower()}" : "";
            bool hasWhere = !string.IsNullOrWhiteSpace(ctx.PanelItem.Concept.SqlSetWhere);
            bool isCachedCohort = ctx.PanelItem.Concept.SqlSetFrom.Contains(cohortOptions.SetCohort);

            var targetColumn = ctx.TargetColumn;
            string groupByColumns = ctx.TargetColumn;

            if (ctx.IsSequential)
            {
                var encounterBasedGroup = "";
                if (ctx.PanelItem.Concept.IsEncounterBased)
                {
                    encounterBasedGroup = $", {itemAlias}.{compilerOptions.FieldEncounterId}, {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldDate)}";
                }

                var eventBasedGroup = "";
                if (ctx.PanelItem.Concept.IsEventBased)
                {
                    eventBasedGroup = $", {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldEvent)}";
                }

                groupByColumns += encounterBasedGroup + eventBasedGroup;

                // date column
                targetColumn += ", " + (ctx.PanelItem.Concept.IsEncounterBased ? PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldDate) : "NullDateField = CONVERT(DATETIME,NULL)");

                // encounter column
                targetColumn += ", " + (ctx.PanelItem.Concept.IsEncounterBased ? itemAlias + "." + compilerOptions.FieldEncounterId : compilerOptions.FieldEncounterId + " = NULL");

                // event ID column
                if (ctx.PanelItem.Concept.IsEventBased)
                {
                    targetColumn += ", " + PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldEvent);
                }
            }

            // begin sql stitching
            string numericFilterSql = string.Empty;
            string dropdownSql = string.Empty;

            // SELECT ...
            var itemSql = new StringBuilder($"{Dialect.SQL_SELECT} {(ctx.IsExists ? "1" : $"{itemAlias}.{targetColumn}")} ");

            // FROM ...
            itemSql.Append($"{Dialect.SQL_FROM} {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlSetFrom)} AS {itemAlias} ");

            // WHERE ...
            if (hasWhere)
            {
                itemSql.Append($"{Dialect.SQL_WHERE} {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlSetWhere)} ");
            }

            // numeric filter
            if (ctx.PanelItem.UseNumericFilter)
            {
                string equalityOperator = GetEqualityOperator(ctx.PanelItem.NumericFilter.FilterType);
                string numericOperatorSql = ctx.PanelItem.NumericFilter.FilterType == NumericFilterType.Between
                    ? $"{equalityOperator} {ctx.PanelItem.NumericFilter.Filter[0]} AND {ctx.PanelItem.NumericFilter.Filter[1]}"
                    : $"{equalityOperator} {ctx.PanelItem.NumericFilter.Filter[0]}";

                numericFilterSql = $"{AddWhereOrAnd(hasWhere)} {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldNumeric)} {numericOperatorSql} ";

                itemSql.Append(numericFilterSql);
                hasWhere = true;
            }

            // specializations
            if (ctx.PanelItem.HasSpecializations)
            {
                foreach (var spec in ctx.PanelItem.Specializations)
                {
                    dropdownSql = $"{AddWhereOrAnd(hasWhere)} {PrependSetAlias(itemAlias, spec.SqlSetWhere)} ";

                    itemSql.Append(dropdownSql);
                    hasWhere = true;
                }
            }

            // recency filter
            if (ctx.PanelItem.UseRecencyFilter)
            {
                // AND A.DateField = (
                itemSql.Append($"{AddWhereOrAnd(hasWhere)} {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldDate)} = (");
                itemSql.Append(
                    // SELECT ...
                    $"{Dialect.SQL_SELECT} {ctx.PanelItem.SqlRecencyFilter} ({PrependSetAlias(recencyAlias, ctx.PanelItem.Concept.SqlFieldDate)})" +
                    // FROM ...
                    $"{Dialect.SQL_FROM} {PrependSetAlias(recencyAlias, ctx.PanelItem.Concept.SqlSetFrom)} {recencyAlias} " +
                    // WHERE ...
                    $"{Dialect.SQL_WHERE} {PrependSetAlias(recencyAlias, ctx.PanelItem.Concept.SqlSetWhere)} {(numericFilterSql + dropdownSql).Replace(itemAlias, recencyAlias)} " +
                    // AND A.PersonId = A_min.PersonId)
                    $"{AddWhereOrAnd(hasWhere)} {itemAlias}.{compilerOptions.FieldPersonId} = {recencyAlias}.{compilerOptions.FieldPersonId})");

                hasWhere = true;
            }

            // date filter
            if (ctx.FilterDate && ctx.PanelItem.Concept.IsEncounterBased)
            {
                // if sequential and not first in sequence, filter only
                // from start date, padding by -6 months
                if (ctx.IsSequential && ctx.PanelItem.SubPanelIndex > 0)
                {
                    // AND A.DateField >= DATEADD(MONTH,-6,'2000-01-01')
                    itemSql.Append($"{AddWhereOrAnd(hasWhere)} {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldDate)} >= DATEADD(MONTH,-6,{AddDate(ctx.DateStart, false)}) ");
                }
                else
                {
                    // AND A.DateField BETWEEN '2000-01-01' AND '2000-12-31'
                    itemSql.Append($"{AddWhereOrAnd(hasWhere)} {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldDate)} BETWEEN " +
                        $"{AddDate(ctx.DateStart, false)} AND {AddDate(ctx.DateStop, true)} ");
                }

                hasWhere = true;
            }

            // exists filter
            if (ctx.IsExists)
            {
                string joinField = isCachedCohort ? cohortOptions.FieldCohortPersonId : ctx.ExistsJoinColumn;
                itemSql.Append($"{AddWhereOrAnd(hasWhere)} {ctx.ExistsParentAlias}.{ctx.ExistsJoinColumn} = {itemAlias}.{joinField} ");
            }

            // GROUP BY ...
            if (!ctx.IsSequential && !isCachedCohort)
            {
                itemSql.Append($"{Dialect.SQL_GROUPBY} {itemAlias}.{groupByColumns}");
            }

            // HAVING ...
            if (ctx.FilterCount && !ctx.IsSequential && ctx.PanelItem.Concept.IsEncounterBased)
            {
                itemSql.Append($" HAVING COUNT(DISTINCT {PrependSetAlias(itemAlias, ctx.PanelItem.Concept.SqlFieldDate)}) >= {ctx.MinCount}");
            }

            return itemSql.ToString();
        }

        void ValidateSql(string input)
        {
            new SqlValidator(Dialect.IllegalCommands).Validate(input);
        }

        string AddDate(DateFilter filter, bool setToEndOfDay)
        {
            var timeFormat = "yyyy-MM-dd HH:mm:ss";
            var defaultTime = new DateTime(filter.Date.Year, filter.Date.Month, filter.Date.Day, 0, 0, 0);
            var date = setToEndOfDay 
                ? defaultTime.AddHours(23).AddMinutes(59).AddSeconds(59)
                : defaultTime;
            
            return
                filter.DateIncrementType == DateIncrementType.Now ? Dialect.SQL_NOW :
                filter.DateIncrementType == DateIncrementType.Specific ? $"'{date.ToString(timeFormat)}'" :
                $"{Dialect.SQL_DATEADD}{filter.DateIncrementType.ToString().ToUpper()},{filter.Increment},{Dialect.SQL_NOW})";
        }

        string AddWhereOrAnd(bool hasWhere) => hasWhere ? $"{Dialect.SQL_AND} " : $"{Dialect.SQL_WHERE} ";

        string GetJoiningAlias(string targetColumn) => targetColumn == compilerOptions.FieldPersonId ? Dialect.ALIAS_PERSON : Dialect.ALIAS_ENCOUNTER;

        string PrependSetAlias(string setAlias, string inputSql) => inputSql.Replace(compilerOptions.Alias, setAlias);

        string GetRecencyFilter(RecencyFilterType type)
        {
            switch (type)
            {
                case RecencyFilterType.Min:
                    return Dialect.SQL_MIN;
                case RecencyFilterType.Max:
                    return Dialect.SQL_MAX;
                default:
                    return null;
            }
        }

        string GetEqualityOperator(NumericFilterType? type)
        {
            if (type == null) return null;
            switch (type)
            {
                case NumericFilterType.GreaterThan:
                    return ">";
                case NumericFilterType.GreaterThanOrEqualTo:
                    return ">=";
                case NumericFilterType.LessThan:
                    return "<";
                case NumericFilterType.LessThanOrEqualTo:
                    return "<=";
                case NumericFilterType.EqualTo:
                    return "=";
                case NumericFilterType.Between:
                    return "BETWEEN";
                default:
                    return null;
            }
        }
    }
}
