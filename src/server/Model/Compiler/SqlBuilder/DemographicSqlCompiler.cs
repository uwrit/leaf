// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Compiler.SqlBuilder;
using Model.Cohort;
using System.Threading.Tasks;

namespace Model.Compiler.PanelSqlCompiler
{
    public class DemographicSqlCompiler : IDemographicSqlCompiler
    {
        readonly IPanelSqlCompiler compiler;
        readonly ICachedCohortPreparer cachedCohortPreparer;

        DemographicExecutionContext executionContext;

        public DemographicSqlCompiler(
            IPanelSqlCompiler compiler,
            ICachedCohortPreparer cachedCohortPreparer)
        {
            this.compiler = compiler;
            this.cachedCohortPreparer = cachedCohortPreparer;
        }

        public async Task<DemographicExecutionContext> BuildDemographicSql(DemographicCompilerContext context, bool restrictPhi)
        {
            executionContext = new DemographicExecutionContext(context.Shape, context.QueryContext);
            new SqlValidator(SqlCommon.IllegalCommands).Validate(context.DemographicQuery);

            await cachedCohortPreparer.SetQueryCohort(context.QueryContext.QueryId, false);
            var prelude = await cachedCohortPreparer.Prepare();
            var epilogue = cachedCohortPreparer.Complete();
            var cohortCte = cachedCohortPreparer.CohortToCte();
            var datasetCte = CteDemographicInternals(context.DemographicQuery);
            var filterCte = CteFilterInternals(context, restrictPhi);
            var select = SelectFromCTE();

            AddParameters(context.QueryContext.QueryId);
            executionContext.QueryPrelude = prelude;
            executionContext.QueryEpilogue = epilogue;
            executionContext.CompiledQuery = Compose(cohortCte, datasetCte, filterCte, select);

            return executionContext;
        }

        void AddParameters(Guid queryId)
        {
            executionContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, queryId);
            foreach (var param in compiler.BuildContextQueryParameters())
            {
                executionContext.AddParameter(param);
            }
        }

        string Compose(string cohort, string dataset, string filter, string select)
        {
            return $"WITH cohort AS ( {cohort} ), dataset AS ( {dataset} ), filter AS ( {filter} ) {select}";
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
