// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Composure;
using Model.Options;

namespace Model.Compiler.Common
{
    class ConceptDatasetSqlSet : PanelItemSqlSet
    {
        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }
        internal PanelItem PanelItem { get; set; }
        internal CompilerOptions CompilerOptions { get; set; }
        internal ISqlDialect Dialect { get; set; }

        public ConceptDatasetSqlSet(
            Panel panel,
            SubPanel subpanel,
            PanelItem panelitem,
            CompilerOptions comp,
            ISqlDialect dialect) : base(panel, subpanel, panelitem, comp, dialect)
        {
            Panel = panel;
            SubPanel = subpanel;
            PanelItem = panelitem;
            CompilerOptions = comp;
            SetSelect();
        }

        internal override void SetSelect()
        {
            // Ensure personId and encounterId are always strings
            var cols = new List<ExpressedColumn>();
            var dateField = new ExpressedColumn(Date, ConceptColumns.DateField);

            var personId = new ExpressedColumn(
                new Expression(Dialect.Convert(ColumnType.STRING, PersonId)),
                DatasetColumns.PersonId);
            var encounterId = new ExpressedColumn(
                new Expression(Dialect.Convert(ColumnType.STRING, EncounterId)),
                EncounterColumns.EncounterId);

            cols.Add(personId);
            cols.Add(encounterId);
            cols.Add(dateField);

            if (PanelItem != null && PanelItem.UseNumericFilter)
            {
                var numericField = new ExpressedColumn(Number, ConceptColumns.NumberField);
                cols.Add(numericField);
            }

            Select = cols;
        }

        internal override void SetGroupBy() { }

        internal override void SetHaving() { }
    }

    class CachedCohortSqlSet : NamedSet
    {
        public Column PersonId = new Column("PersonId");
        public Column Salt = new Column("Salt");
        public Column QueryId = new Column("QueryId");
        public Column Exported = new Column("Exported");
        readonly string queryParamPlaceholder = "___queryid___";

        public CachedCohortSqlSet(CompilerOptions compilerOptions)
        {
            Select = new ISelectable[]
            {
                new ExpressedColumn(PersonId, DatasetColumns.PersonId),
                Salt
            };
            From = $"{compilerOptions.AppDb}.app.Cohort";
            Where = new[] { QueryId == new UnaliasedColumn(queryParamPlaceholder) & Exported == true };
        }

        public override string ToString()
        {
            return base.ToString()
                .Replace(queryParamPlaceholder, ShapedDatasetCompilerContext.QueryIdParam);
        }
    }
}
