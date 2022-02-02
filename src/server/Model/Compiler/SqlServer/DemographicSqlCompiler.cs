// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Compiler.SqlBuilder;
using Model.Options;
using Microsoft.Extensions.Options;
using Model.Cohort;
using System.Threading.Tasks;

namespace Model.Compiler.SqlServer
{
    public class DemographicSqlCompiler : IDemographicSqlCompiler
    {
        readonly ISqlCompiler compiler;
        readonly ICachedCohortPreparer cachedCohortPreparer;
        readonly CompilerOptions compilerOptions;

        DemographicExecutionContext executionContext;

        public DemographicSqlCompiler(
            ISqlCompiler compiler,
            ICachedCohortPreparer cachedCohortPreparer,
            IOptions<CompilerOptions> compilerOptions)
        {
            this.compiler = compiler;
            this.cachedCohortPreparer = cachedCohortPreparer;
            this.compilerOptions = compilerOptions.Value;
        }

        public async Task<DemographicExecutionContext> BuildDemographicSql(DemographicCompilerContext context, bool restrictPhi)
        {
            executionContext = new DemographicExecutionContext(context.Shape, context.QueryContext);
            new SqlValidator(SqlCommon.IllegalCommands).Validate(context.DemographicQuery);

            var parameters = compiler.BuildContextParameterSql();
            var prelude = await cachedCohortPreparer.Prepare(context.QueryContext.QueryId);
            var cohortCte = CteCohortInternals(context.QueryContext);
            var datasetCte = CteDemographicInternals(context.DemographicQuery);
            var filterCte = CteFilterInternals(context, restrictPhi);
            var select = SelectFromCTE();

            executionContext.QueryPrelude = prelude;
            executionContext.CompiledQuery = Compose(parameters, cohortCte, datasetCte, filterCte, select);

            return executionContext;
        }

        string Compose(string parameters, string cohort, string dataset, string filter, string select)
        {
            return $"{parameters} WITH cohort as ( {cohort} ), dataset as ( {dataset} ), filter as ( {filter} ) {select}";
        }

        string CteCohortInternals(QueryContext context)
        {
            executionContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, context.QueryId);
            return cachedCohortPreparer.CohortToCte();
        }

        string CteDemographicInternals(DemographicQuery demographicQuery) => demographicQuery.SqlStatement;

        string CteFilterInternals(DemographicCompilerContext context, bool restrictPhi)
        {
            var schema = ShapedDatasetContract.For(context.Shape);

            if (!restrictPhi)
            {
                executionContext.FieldSelectors = schema.Fields;
                return $"SELECT * FROM dataset";
            }

            static bool include(SchemaFieldSelector field) => field.Required || !field.Phi || field.Mask;

            var restricted = schema.Fields.Where(include);
            var fields = string.Join(", ", restricted.Select(f => f.Name));
            executionContext.FieldSelectors = restricted;
            return $"SELECT {fields} FROM dataset";
        }

        string SelectFromCTE()
        {
            return
                @$"SELECT Exported, Salt, filter.*
                   FROM filter INNER JOIN cohort on filter.{DatasetColumns.PersonId} = cohort.{cachedCohortPreparer.FieldInternalPersonId}";
        }
    }
}
