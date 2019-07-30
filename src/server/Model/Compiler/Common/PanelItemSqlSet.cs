// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Options;
using Composure;

namespace Model.Compiler.Common
{
    class PanelItemSequentialSqlSet : PanelItemSqlSet
    {
        public PanelItemSequentialSqlSet(Panel panel, SubPanel subpanel, PanelItem panelitem, CompilerOptions compilerOptions) : base(panel, subpanel, panelitem, compilerOptions)
        {

        }

        internal override void SetSelect()
        {
            if (concept.IsEventBased)
            {
                Select = new[] { PersonId, EncounterId, Date, EventId };
            }
            else
            {
                Select = new[] { PersonId, EncounterId, Date };
            }
        }

        internal override void SetGroupBy()
        {
            // Do nothing. Group By clauses in a sequence are added in the parent PanelSequentialSqlSet.
        }

        internal override void SetHaving()
        {
            // Do nothing. HAVING clauses in a sequence are added in the parent PanelSequentialSqlSet.
        }
    }
    

    class PanelItemSqlSet : NamedSet
    {
        protected CompilerOptions compilerOptions;
        protected Panel panel;
        protected SubPanel subpanel;
        protected PanelItem panelitem;
        protected Concept concept;

        protected Column PersonId;
        protected Column EncounterId;
        protected AutoAliasedColumn Date;
        protected AutoAliasedColumn EventId;

        readonly List<IEvaluatable> where = new List<IEvaluatable>() { };

        new string Alias => $"{Dialect.Alias.Person}{panel.Index}{subpanel.Index}{panelitem.Index}";

        public PanelItemSqlSet(Panel panel, SubPanel subpanel, PanelItem panelitem, CompilerOptions compilerOptions)
        {
            this.panel = panel;
            this.subpanel = subpanel;
            this.panelitem = panelitem;
            this.compilerOptions = compilerOptions;
            base.Alias = Alias;
            concept = panelitem.Concept;

            SetColumns();
            SetSelect();
            SetFrom();
            SetWhere();
            SetGroupBy();
            SetHaving();
        }

        public override string ToString()
        {
            return base
                .ToString()
                .Replace(compilerOptions.Alias, Alias);
        }

        void SetColumns()
        {
            var aliasMarker = compilerOptions.Alias;
            PersonId = new Column(compilerOptions.FieldPersonId);

            if (concept.IsEncounterBased)
            {
                EncounterId = new Column(compilerOptions.FieldEncounterId);
                Date = new AutoAliasedColumn(concept.SqlFieldDate, aliasMarker, this);
            }
            if (concept.IsEventBased)
            {
                EventId = new AutoAliasedColumn(concept.SqlFieldEvent, aliasMarker, this);
            }
        }

        internal virtual void SetSelect()
        {
            Select = new[] { PersonId };
        }

        internal virtual void SetFrom()
        {
            From = concept.SqlSetFrom;
        }

        internal virtual void SetWhere()
        {
            if (!string.IsNullOrWhiteSpace(concept.SqlSetWhere))
            {
                where.Add(new RawEval(concept.SqlSetWhere));
            }

            CheckDate();
            CheckSpecializations();
            CheckNumericFilter();
            Where = where;
        }

        internal virtual void SetGroupBy()
        {
            if (concept.IsEncounterBased)
            {
                GroupBy = new[] { PersonId };
            }
        }

        internal virtual void SetHaving()
        {
            if (subpanel.HasCountFilter)
            {
                var uniqueDates = new Expression($"{Dialect.Syntax.COUNT} ({Dialect.Syntax.DISTINCT} {Date})");
                
                Having = new List<IEvaluatableAggregate>
                {
                    uniqueDates >= subpanel.MinimumCount
                };
            }
        }

        void CheckDate()
        {
            if (panel.IsDateFiltered && concept.IsEncounterBased)
            {
                var start = GetDateExpression(panel.DateFilter.Start);
                var end = GetDateExpression(panel.DateFilter.End, true);

                if (panel.PanelType == PanelType.Sequence && subpanel.Index > 0)
                {
                    var offset = new Expression($"{Dialect.Syntax.DATEADD}({Dialect.Time.MONTH}, {-6}, {start})");
                    where.Add(Date >= offset);
                }
                else
                {
                    where.Add(Date == start & end);
                }
            }
        }

        void CheckSpecializations()
        {
            if (panelitem.HasSpecializations)
            {
                foreach (var spec in panelitem.Specializations)
                {
                    where.Add(new RawEval(spec.SqlSetWhere));
                }
            }
        }

        void CheckNumericFilter()
        {
            if (panelitem.UseNumericFilter)
            {
                var col = new AutoAliasedColumn(concept.SqlFieldNumeric, compilerOptions.Alias, this);
                var val1 = panelitem.NumericFilter.Filter[0];

                switch (panelitem.NumericFilter.FilterType)
                {
                    case NumericFilterType.GreaterThan:
                        where.Add(col > val1);
                        return;
                    case NumericFilterType.GreaterThanOrEqualTo:
                        where.Add(col >= val1);
                        return;
                    case NumericFilterType.LessThan:
                        where.Add(col < val1);
                        return;
                    case NumericFilterType.LessThanOrEqualTo:
                        where.Add(col <= val1);
                        return;
                    case NumericFilterType.EqualTo:
                        where.Add(col == val1);
                        return;
                    case NumericFilterType.Between:
                        var val2 = panelitem.NumericFilter.Filter[1];
                        where.Add(col == val1 & val2);
                        return;
                    default:
                        return;
                }
            }
        }

        IExpression GetDateExpression(DateFilter filter)
        {
            return GetDateExpression(filter, false);
        }

        IExpression GetDateExpression(DateFilter filter, bool setToEndOfDay)
        {
            var defaultTime = new DateTime(filter.Date.Year, filter.Date.Month, filter.Date.Day, 0, 0, 0);
            var date = setToEndOfDay
                ? defaultTime.AddHours(23).AddMinutes(59).AddSeconds(59)
                : defaultTime;

            if (filter.DateIncrementType == DateIncrementType.Now)
            {
                return new Expression(Dialect.Syntax.NOW);
            }
            if (filter.DateIncrementType == DateIncrementType.Specific)
            {
                var timeFormat = "yyyy-MM-dd HH:mm:ss";
                return new QuotedExpression(date.ToString(timeFormat));
            }

            var incrType = filter.DateIncrementType.ToString().ToUpper();
            return new Expression($"{Dialect.Syntax.DATEADD}({incrType}, {filter.Increment}, {Dialect.Syntax.NOW})");
        }
    }
}
