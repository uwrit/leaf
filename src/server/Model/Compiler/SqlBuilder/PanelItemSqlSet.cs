// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Options;
using Composure;

namespace Model.Compiler.SqlBuilder
{
    class PanelItemSequentialSqlSet : PanelItemSqlSet
    {
        public PanelItemSequentialSqlSet(
            Panel panel,
            SubPanel subpanel,
            PanelItem panelitem,
            CompilerOptions comp,
            ISqlDialect dialect) : base(panel, subpanel, panelitem, comp, dialect)
        {

        }

        internal override void SetSelect()
        {
            Select = new[] { PersonId, EncounterId, Date, EventId };
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
        readonly ISqlDialect dialect;
        readonly CompilerOptions compilerOptions;
        readonly Panel panel;
        readonly SubPanel subpanel;
        readonly PanelItem panelitem;
        readonly Concept concept;
        readonly List<IEvaluatable> where = new List<IEvaluatable>();

        internal Column PersonId;
        internal Column EncounterId;
        internal EventIdColumn EventId;
        internal AutoAliasedColumn Date;
        internal AutoAliasedColumn Number;

        new string Alias => $"{SqlCommon.Alias.Person}{panel.Index}{subpanel.Index}{panelitem.Index}";

        public PanelItemSqlSet(
            Panel panel,
            SubPanel subpanel,
            PanelItem panelitem,
            CompilerOptions comp,
            ISqlDialect dialect)
        {
            this.panel = panel;
            this.subpanel = subpanel;
            this.panelitem = panelitem;
            this.compilerOptions = comp;
            this.dialect = dialect;
            base.Alias = Alias;
            concept = panelitem.Concept;

            Configure();
        }

        public override string ToString()
        {
            return base
                .ToString()
                .Replace(compilerOptions.Alias, Alias);
        }

        void Configure()
        {
            SetColumns();
            SetSelect();
            SetFrom();
            SetWhere();
            SetGroupBy();
            SetHaving();
        }

        void SetColumns()
        {
            var aliasMarker = compilerOptions.Alias;
            PersonId = new Column(compilerOptions.FieldPersonId, this);

            if (concept.IsEncounterBased)
            {
                EncounterId = new Column(compilerOptions.FieldEncounterId, this);
                Date = new AutoAliasedColumn(concept.SqlFieldDate, aliasMarker, this);
            }
            if (concept.IsEventBased)
            {
                EventId = new EventIdColumn(concept.SqlFieldEvent, aliasMarker, this);
            }
            else
            {
                EventId = new EventIdColumn();
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
                var uniqueDates = new Expression($"{SqlCommon.Syntax.Count}({SqlCommon.Syntax.Distinct} {Date})");
                
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
                    var offset = new Expression(dialect.DateAdd(DateIncrementType.Month, -6, start));
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
                Number = new AutoAliasedColumn(concept.SqlFieldNumeric, compilerOptions.Alias, this);
                var val1 = panelitem.NumericFilter.Filter[0];

                switch (panelitem.NumericFilter.FilterType)
                {
                    case NumericFilterType.GreaterThan:
                        where.Add(Number > val1);
                        return;
                    case NumericFilterType.GreaterThanOrEqualTo:
                        where.Add(Number >= val1);
                        return;
                    case NumericFilterType.LessThan:
                        where.Add(Number < val1);
                        return;
                    case NumericFilterType.LessThanOrEqualTo:
                        where.Add(Number <= val1);
                        return;
                    case NumericFilterType.EqualTo:
                        where.Add(Number == val1);
                        return;
                    case NumericFilterType.Between:
                        var val2 = panelitem.NumericFilter.Filter[1];
                        where.Add(Number == val1 & val2);
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
                return new Expression(dialect.Now());
            }
            if (filter.DateIncrementType == DateIncrementType.Specific)
            {
                var timeFormat = "yyyy-MM-dd HH:mm:ss";
                return new QuotedExpression(date.ToString(timeFormat));
            }

            return new Expression(dialect.DateAdd(filter.DateIncrementType, filter.Increment, dialect.Now()));
        }
    }
}
