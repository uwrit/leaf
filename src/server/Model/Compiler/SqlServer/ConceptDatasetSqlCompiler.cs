// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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

        public ConceptDatasetExecutionContext BuildConceptDatasetSql(PanelDatasetCompilerContext ctx)
        {
            var p = ctx.Panel;
            var sp = p.SubPanels.First();
            var pi = sp.PanelItems.First();
            var cohortSql = new CachedCohortSqlSet(compilerOptions).ToString();
            var conceptSql = new ConceptDatasetSqlSet(p, sp, pi, compilerOptions).ToString();
            new SqlValidator(Dialect.IllegalCommands).Validate(conceptSql);

            var exeContext = new ConceptDatasetExecutionContext(ctx.QueryContext, ctx.QueryContext.QueryId);
            exeContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, ctx.QueryContext.QueryId);
            exeContext.CompiledQuery = Compose(cohortSql, conceptSql);

            return exeContext;
        }

        string Compose(string cohortSql, string conceptSql)
        {
            var select = $"SELECT DS.*, C.Salt FROM dataset AS DS INNER JOIN cohort AS C ON DS.{DatasetColumns.PersonId} = C.{DatasetColumns.PersonId}";

            return $"WITH cohort AS ( {cohortSql} ), dataset AS ( {conceptSql} ) {select}";
        }
    }
}