// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Model.Compiler.SqlBuilder;
using Model.Options;

namespace Model.Compiler.PanelSqlCompiler
{
    public class PanelDatasetSqlCompiler : IPanelDatasetSqlCompiler
    {
        readonly CompilerOptions compilerOptions;
        readonly ISqlDialect dialect;
        readonly ICachedCohortPreparer cachedCohortPreparer;

        public PanelDatasetSqlCompiler(
            IOptions<CompilerOptions> compilerOptions,
            ISqlDialect dialect,
            ICachedCohortPreparer cachedCohortPreparer)
        {
            this.compilerOptions = compilerOptions.Value;
            this.dialect = dialect;
            this.cachedCohortPreparer = cachedCohortPreparer;
        }

        public async Task<ConceptDatasetExecutionContext> BuildPanelDatasetSql(PanelDatasetCompilerContext compilerContext)
        {
<<<<<<< HEAD
            var prelude = await cachedCohortPreparer.Prepare(compilerContext.QueryContext.QueryId, true);
            var epilogue = cachedCohortPreparer.Complete();
=======
            await cachedCohortPreparer.SetQueryCohort(compilerContext.QueryContext.QueryId, true);
            var prelude = await cachedCohortPreparer.Prepare();
>>>>>>> dashboard-v2
            var query = new DatasetNonAggregateJoinedSqlSet(compilerContext.Panel, compilerOptions, dialect, cachedCohortPreparer).ToString();
            new SqlValidator(SqlCommon.IllegalCommands).Validate(query);

            var exeContext = new ConceptDatasetExecutionContext(compilerContext.QueryContext, compilerContext.QueryContext.QueryId);
            exeContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, compilerContext.QueryContext.QueryId);
            exeContext.QueryPrelude = prelude;
            exeContext.CompiledQuery = query;
<<<<<<< HEAD
            exeContext.QueryEpilogue = epilogue;
=======
>>>>>>> dashboard-v2

            return exeContext;
        }
    }
}