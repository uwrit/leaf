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
using Services.Cohort;
using Model.Cohort;

/*
 * This needs to receive a CompilerOptions for the personid and encounterid fields.
 * Should return a context containing the DatasetQuery and the parameterized query.
 * The runner and anonymizer will need both to produce the correct dataset and enable guard rails re: types.
 */

/*
 * Example Target Sql
WITH cohort as
(
    select PersonId, Exported, case when Exported = 1 then 'abc' else NULL end as Salt
    from LeafDB.app.Cohort
    where QueryId = '9824433e-f36b-1410-86f1-00ffffffffff'
)
,dataset as
(
    SELECT person_id = p.person_id, addressPostalCode = l.zip, addressState = p.location_state, ethnicity = p.ethnicity, gender = CASE WHEN p.gender = 'F' THEN 'female' WHEN p.gender = 'M' THEN 'male' ELSE 'other' END, [language] = 'Unknown', maritalStatus = 'Unknown', race = p.race, religion = 'Unknown', isMarried = 0, isHispanic = CASE WHEN p.ethnicity_code = 38003563 THEN 1 ELSE 0 END, isDeceased = CASE WHEN p.death_date IS NULL THEN 0 ELSE 1 END, birthDate = p.birth_datetime, [name] = 'Unknown Unknown', mrn = 'abc12345' FROM v_person p JOIN person ps on p.person_id = ps.person_id LEFT JOIN [location] l on ps.location_id = l.location_id
)
,fields as
(
    select person_id, addressPostalCode, addressState, ethnicity, gender, [language], maritalStatus, race, religion, isMarried, isHispanic, isDeceased
    from dataset d
    where d.person_id in (
        select PersonId
        from cohort
    )
)
select Exported, Salt, person_id, addressPostalCode, addressState, ethnicity, gender, [language], maritalStatus, race, religion, isMarried, isHispanic, isDeceased
from fields
left join cohort on fields.person_id = cohort.PersonId
 */

namespace Services.Compiler.SqlServer
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
