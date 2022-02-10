// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Model.Compiler.SqlBuilder;
using Model.Options;

namespace Model.Compiler.PanelSqlCompiler
{
    public class ConceptDatasetSqlCompiler : IConceptDatasetSqlCompiler
    {
        readonly CompilerOptions compilerOptions;
        readonly ISqlDialect dialect;
        readonly ICachedCohortPreparer cachedCohortPreparer;

        public ConceptDatasetSqlCompiler(
            IOptions<CompilerOptions> compilerOptions,
            ISqlDialect dialect,
            ICachedCohortPreparer cachedCohortPreparer)
        {
            this.compilerOptions = compilerOptions.Value;
            this.dialect = dialect;
            this.cachedCohortPreparer = cachedCohortPreparer;
        }

        public async Task<ConceptDatasetExecutionContext> BuildConceptDatasetSql(PanelDatasetCompilerContext ctx)
        {
            var p = ctx.Panel;
            var sp = p.SubPanels.First();
            var pi = sp.PanelItems.First();

            await cachedCohortPreparer.SetQueryCohort(ctx.QueryContext.QueryId, true);
            var prelude = await cachedCohortPreparer.Prepare();
            var cohortSql = cachedCohortPreparer.CohortToCte();
            var conceptSql = new ConceptDatasetSqlSet(p, sp, pi, compilerOptions, dialect).ToString();
            new SqlValidator(SqlCommon.IllegalCommands).Validate(conceptSql);

            var exeContext = new ConceptDatasetExecutionContext(ctx.QueryContext, ctx.QueryContext.QueryId);
            exeContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, ctx.QueryContext.QueryId);
            exeContext.QueryPrelude = prelude;
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