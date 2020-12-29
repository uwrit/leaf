// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Microsoft.Extensions.Options;
using Model.Compiler.Common;
using Model.Options;

namespace Model.Compiler.SqlServer
{
    public class ConceptDatasetSqlCompiler : IConceptDatasetSqlCompiler
    {
        readonly CompilerOptions compilerOptions;

        public ConceptDatasetSqlCompiler(IOptions<CompilerOptions> compOpts)
        {
            this.compilerOptions = compOpts.Value;
        }

        public ConceptDatasetExecutionContext BuildConceptDatasetSql(QueryRef queryRef, Panel panel)
        {
            var sp = panel.SubPanels.First();
            var pi = sp.PanelItems.First();
            var conceptSql = new ConceptJoinedDatasetSqlSet(panel, compilerOptions);
            return new ConceptDatasetExecutionContext(queryRef.Id, conceptSql.ToString());
        }
    }
}