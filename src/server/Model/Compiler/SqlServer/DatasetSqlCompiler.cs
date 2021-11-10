﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler.Common;
using Model.Options;
using Microsoft.Extensions.Options;
using System.Collections.Generic;

namespace Model.Compiler.SqlServer
{
    public class DatasetSqlCompiler : IDatasetSqlCompiler
    {
        readonly ISqlCompiler compiler;
        readonly CompilerOptions compilerOptions;
        readonly string fieldInternalPersonId = "__personId__"; // field mangling

        DatasetExecutionContext executionContext;

        public DatasetSqlCompiler(
            ISqlCompiler compiler,
            IOptions<CompilerOptions> compOpts)
        {
            this.compiler = compiler;
            this.compilerOptions = compOpts.Value;
        }

        public DatasetExecutionContext BuildDatasetSql(DatasetCompilerContext compilerContext)
        {
            executionContext = new DatasetExecutionContext(compilerContext.Shape, compilerContext.QueryContext, compilerContext.DatasetQuery.Id.Value);

            var cohort = CteCohortInternals(compilerContext);

            new SqlValidator(Dialect.IllegalCommands).Validate(compilerContext.DatasetQuery.SqlStatement);
            var dataset = CteDatasetInternals(compilerContext.DatasetQuery);

            var filter = CteFilterInternals(compilerContext);
            var select = SelectFromCTE(compilerContext);
            var parameters = compiler.BuildContextParameterSql();
            executionContext.DatasetQuery = compilerContext.DatasetQuery;
            executionContext.CompiledQuery = Compose(parameters, cohort, dataset, filter, select);

            return executionContext;
        }

        string Compose(string parameters, string cohort, string dataset, string filter, string select)
        {
            return $"{parameters} WITH cohort AS ( {cohort} ), dataset AS ( {dataset} ), filter AS ( {filter} ) {select}";
        }

        string CteCohortInternals(DatasetCompilerContext ctx)
        {
            executionContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, ctx.QueryContext.QueryId);

            // If joining to a given panel to filter by encounter.
            if (ctx.JoinToPanel)
            {
                return new DatasetJoinedSqlSet(ctx.Panel, compilerOptions).ToString();
            }

            // Else return standard cached cohort.
            return $"SELECT {fieldInternalPersonId} = PersonId, Salt FROM {compilerOptions.AppDb}.app.Cohort WHERE QueryId = {ShapedDatasetCompilerContext.QueryIdParam} AND Exported = 1";
        }

        string CteDatasetInternals(IDatasetQuery datasetQuery) => datasetQuery.SqlStatement;

        string CteFilterInternals(DatasetCompilerContext compilerContext)
        {
            var provider = DatasetDateFilterProvider.For(compilerContext);
            
            // Dynamic datasets may have no datefield
            if (!provider.CanFilter)
            {
                return $"SELECT * FROM dataset";
            }

            var dateFilter = provider.GetDateFilter(compilerContext);
            executionContext.AddParameters(dateFilter.Parameters);
            return $"SELECT * FROM dataset WHERE {dateFilter.Clause}";
        }

        string SelectFromCTE(DatasetCompilerContext ctx)
        {
            var query = $"SELECT Salt, filter.* FROM filter INNER JOIN cohort";

            if (ctx.JoinToPanel)
            {
                return $"{query} ON filter.{DatasetColumns.PersonId} = cohort.{DatasetColumns.PersonId} AND filter.{EncounterColumns.EncounterId} = cohort.{EncounterColumns.EncounterId}";
            }
            return $"{query} ON filter.{DatasetColumns.PersonId} = cohort.{fieldInternalPersonId}";
        }
    }

    abstract class DatasetDateFilterProvider
    {
        const string earlyParamName = "@early";
        const string lateParamName = "@late";

        protected abstract string TargetDateField { get; }

        public bool CanFilter => !string.IsNullOrWhiteSpace(TargetDateField);

        public static DatasetDateFilterProvider For(DatasetCompilerContext compilerContext)
        {
            switch (compilerContext.Shape)
            {
                case Shape.Dynamic:
                    return new DynamicDatasetDateFilterProvider((compilerContext.DatasetQuery as DynamicDatasetQuery).SqlFieldDate);
                case Shape.Observation:
                    return new ObservationDatasetDateFilterProvider();
                case Shape.Encounter:
                    return new EncounterDatasetDateFilterProvider();
                case Shape.Condition:
                    return new ConditionDatasetDateFilterProvider();
                case Shape.Procedure:
                    return new ProcedureDatasetDateFilterProvider();
                case Shape.Immunization:
                    return new ImmunizationDatasetDateFilterProvider();
                case Shape.Allergy:
                    return new AllergyDatasetDateFilterProvider();
                case Shape.MedicationRequest:
                    return new MedicationRequestDateFilterProvider();
                case Shape.MedicationAdministration:
                    return new MedicationAdministrationDateFilterProvider();
                default:
                    throw new ArgumentException($"{compilerContext.Shape} switch branch not implemented");
            }
        }

        public DatasetDateFilter GetDateFilter(DatasetCompilerContext compilerContext)
        {
            var early = compilerContext.EarlyBound;
            var late = compilerContext.LateBound;

            // neither
            if (!early.HasValue && !late.HasValue)
            {
                var now = DateTime.Now;
                var clause = $"{TargetDateField} <= {lateParamName}";
                return new DatasetDateFilter
                {
                    Clause = clause,
                    Parameters = new QueryParameter[] { new QueryParameter(lateParamName, now) }
                };
            }

            // both present
            if (early.HasValue && late.HasValue)
            {
                var clause = $"{TargetDateField} {Dialect.Syntax.BETWEEN} {earlyParamName} {Dialect.Syntax.AND} {lateParamName}";
                return new DatasetDateFilter
                {
                    Clause = clause,
                    Parameters = new QueryParameter[]
                    {
                        new QueryParameter(earlyParamName, early.Value),
                        new QueryParameter(lateParamName, late.Value)
                    }
                };
            }

            // early only
            if (early.HasValue && !late.HasValue)
            {
                var now = DateTime.Now;
                var clause = $"{TargetDateField} {Dialect.Syntax.BETWEEN} {earlyParamName} {Dialect.Syntax.AND} {lateParamName}";
                return new DatasetDateFilter
                {
                    Clause = clause,
                    Parameters = new QueryParameter[]
                    {
                        new QueryParameter(earlyParamName, early.Value),
                        new QueryParameter(lateParamName, now)
                    }
                };
            }

            // late only
            else
            {
                var clause = $"{TargetDateField} <= {lateParamName}";
                return new DatasetDateFilter
                {
                    Clause = clause,
                    Parameters = new QueryParameter[] { new QueryParameter(lateParamName, late.Value) }
                };
            }
        }
    }

    class DynamicDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        string _field { get; set; }

        public DynamicDatasetDateFilterProvider(string targetDateField)
        {
            _field = targetDateField;
        }

        protected override string TargetDateField => _field;
    }

    class ObservationDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => ObservationColumns.EffectiveDate;
    }

    class EncounterDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => EncounterColumns.AdmitDate;
    }

    class ConditionDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => ConditionColumns.OnsetDateTime;
    }

    class ProcedureDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => ProcedureColumns.PerformedDateTime;
    }

    class ImmunizationDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => ImmunizationColumns.OccurrenceDateTime;
    }

    class AllergyDatasetDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => AllergyColumns.OnsetDateTime;
    }

    class MedicationRequestDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => MedicationRequestColumns.AuthoredOn;
    }

    class MedicationAdministrationDateFilterProvider : DatasetDateFilterProvider
    {
        protected override string TargetDateField => MedicationAdministrationColumns.EffectiveDateTime;
    }

    class DatasetDateFilter
    {
        public string Clause { get; set; }
        public ICollection<QueryParameter> Parameters { get; set; }
    }
}
