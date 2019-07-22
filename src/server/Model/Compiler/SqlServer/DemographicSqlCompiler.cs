// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Text;
using System.Linq;
using Model.Compiler;
using Model.Options;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using Model.Cohort;

namespace Model.Compiler.SqlServer
{
    public class DemographicSqlCompiler : IDemographicSqlCompiler
    {
        readonly CompilerOptions compilerOptions;
        readonly string fieldInternalPersonId = "__personId__"; // field mangling

        DemographicExecutionContext executionContext;

        public DemographicSqlCompiler(
            IOptions<CompilerOptions> compOpts)
        {
            compilerOptions = compOpts.Value;
        }

        public DemographicExecutionContext BuildDemographicSql(DemographicCompilerContext context, bool restrictPhi)
        {
            executionContext = new DemographicExecutionContext(context.Shape, context.QueryContext);

            var cohort = CteCohortInternals(context.QueryContext);
            new SqlValidator(Dialect.ILLEGAL_COMMANDS).Validate(context.DemographicQuery);
            var dataset = CteDemographicInternals(context.DemographicQuery);

            var filter = CteFilterInternals(context, restrictPhi);
            var select = SelectFromCTE();
            executionContext.CompiledQuery = Compose(cohort, dataset, filter, select);

            return executionContext;
        }

        string Compose(string cohort, string dataset, string filter, string select)
        {
            return $"WITH cohort as ( {cohort} ), dataset as ( {dataset} ), filter as ( {filter} ) {select}";
        }

        string CteCohortInternals(QueryContext context)
        {
            executionContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, context.QueryId);
            return $"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt FROM {compilerOptions.AppDb}.app.Cohort WHERE QueryId = {ShapedDatasetCompilerContext.QueryIdParam}";
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

            bool include(SchemaFieldSelector field) => field.Required || !field.Phi || field.Mask;

            var restricted = schema.Fields.Where(include);
            executionContext.FieldSelectors = restricted;
            var fields = string.Join(", ", restricted.Select(f => f.Name));
            return $"SELECT {fields} FROM dataset";
        }

        string SelectFromCTE()
        {
            return $"SELECT Exported, Salt, filter.* FROM filter INNER JOIN cohort on filter.{DatasetColumns.PersonId} = cohort.{fieldInternalPersonId}";
        }
    }
}
