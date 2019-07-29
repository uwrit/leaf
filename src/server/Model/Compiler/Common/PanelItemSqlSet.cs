// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Model.Options;
using Composure;

namespace Model.Compiler.Common
{
    class PanelItemSequentialSqlSet : PanelItemSqlSet
    {
        public PanelItemSequentialSqlSet(Panel panel, SubPanel subpanel, PanelItem panelitem) : base(panel, subpanel, panelitem)
        {
            var personId = new Column(compilerOptions.FieldPersonId);
            var encounterId = new Column(compilerOptions.FieldEncounterId);
            var date = new Column(concept.SqlFieldDate);

            Select = new[] { personId, encounterId, date };
        }
    }
    

    class PanelItemSqlSet : NamedSet
    {
        protected CompilerOptions compilerOptions;
        protected Panel panel;
        protected SubPanel subpanel;
        protected PanelItem panelitem;
        protected Concept concept;
        readonly List<ISelectable> select = new List<ISelectable>() { };
        readonly List<IEvaluatable> where = new List<IEvaluatable>() { };

        new string Alias => $"{Dialect.Alias.Person}{panel.Index}{subpanel.Index}{panelitem.Index}";

        public PanelItemSqlSet(Panel panel, SubPanel subpanel, PanelItem panelitem)
        {
            this.panel = panel;
            this.subpanel = subpanel;
            this.panelitem = panelitem;
            base.Alias = Alias;
            concept = panelitem.Concept;

            SetSelect();
            SetFrom();
            SetWhere();
        }

        void SetSelect()
        {
            select.Add(new Column(compilerOptions.FieldPersonId));
            Select = select;
        }

        void SetFrom()
        {
            From = concept.SqlSetFrom;
        }

        void SetWhere()
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

        void CheckDate()
        {
            if (panel.IsDateFiltered && concept.IsEncounterBased)
            {
                var col = new Column(concept.SqlFieldDate);
                var start = GetDateExpression(panel.DateFilter.Start);
                var end = GetDateExpression(panel.DateFilter.End, true);

                if (panel.PanelType == PanelType.Patient && subpanel.Index > 0)
                {
                    var offset = new Expression($"{Dialect.Syntax.DATEADD}({Dialect.Time.MONTH}, {-6}, {start})");
                    where.Add(col >= offset);
                }
                else
                {
                    where.Add(col == start & end);
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
                var col = new Column(concept.SqlFieldNumeric);
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

        Expression GetDateExpression(DateFilter filter)
        {
            return GetDateExpression(filter, false);
        }

        Expression GetDateExpression(DateFilter filter, bool setToEndOfDay)
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
                return new Expression($"'{date.ToString(timeFormat)}'");
            }

            var incrType = filter.DateIncrementType.ToString().ToUpper();
            return new Expression($"{Dialect.Syntax.DATEADD}({incrType}, {filter.Increment}, {Dialect.Syntax.NOW})");
        }
    }
}
