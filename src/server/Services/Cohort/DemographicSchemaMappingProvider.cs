// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Data.Common;
using Model.Compiler;

namespace Services.Cohort
{
    public class DemographicSchemaMappingProvider : IDemographicSchemaMappingProvider
    {
        readonly SqlSelectors selectors;

        public DemographicSchemaMappingProvider(SqlSelectors selectors)
        {
            this.selectors = selectors;
        }

        public DemographicSchema AnonymizedSchema(SqlDataReader reader)
        {
            var mapper = new DemographicSchemaMapper(selectors, reader);

            var schema = mapper.Map(DemographicSchemaColumns.PersonId)
                               .Map(DemographicSchemaColumns.AddressPostalCode)
                               .Map(DemographicSchemaColumns.AddressState)
                               .Map(DemographicSchemaColumns.Ethnicity)
                               .Map(DemographicSchemaColumns.Gender)
                               .Map(DemographicSchemaColumns.Language)
                               .Map(DemographicSchemaColumns.MaritalStatus)
                               .Map(DemographicSchemaColumns.Race)
                               .Map(DemographicSchemaColumns.Religion)
                               .Map(DemographicSchemaColumns.IsMarried)
                               .Map(DemographicSchemaColumns.IsHispanic)
                               .Map(DemographicSchemaColumns.IsDeceased)
                               .Map(DemographicSchemaColumns.BirthDate)
                               .Map(DemographicSchemaColumns.DeathDate)
                               .Schema();
            return schema;
        }

        public DemographicSchema IdentifiedSchema(SqlDataReader reader)
        {
            var mapper = new DemographicSchemaMapper(selectors, reader);

            var schema = mapper.Map(DemographicSchemaColumns.PersonId)
                               .Map(DemographicSchemaColumns.AddressPostalCode)
                               .Map(DemographicSchemaColumns.AddressState)
                               .Map(DemographicSchemaColumns.Ethnicity)
                               .Map(DemographicSchemaColumns.Gender)
                               .Map(DemographicSchemaColumns.Language)
                               .Map(DemographicSchemaColumns.MaritalStatus)
                               .Map(DemographicSchemaColumns.Race)
                               .Map(DemographicSchemaColumns.Religion)
                               .Map(DemographicSchemaColumns.IsMarried)
                               .Map(DemographicSchemaColumns.IsHispanic)
                               .Map(DemographicSchemaColumns.IsDeceased)
                               .Map(DemographicSchemaColumns.BirthDate)
                               .Map(DemographicSchemaColumns.DeathDate)
                               .Map(DemographicSchemaColumns.Name)
                               .Map(DemographicSchemaColumns.Mrn)
                               .Schema();
            return schema;
        }
    }

    class DemographicSchemaMapper
    {
        readonly List<string> errors;
        readonly DemographicSchema schema;
        readonly Dictionary<string, ColumnValidationContext> check;

        public DemographicSchemaMapper(SqlSelectors selectors, SqlDataReader reader)
        {
            errors = new List<string>();

            var fields = selectors.Fields.ToArray();

            var columns = reader.GetColumnSchema()
                                .ToDictionary(c => c.ColumnName);

            check = GetIntermediate(fields, columns);

            schema = new DemographicSchema
            {
                { DemographicSchemaColumns.Exported, 0 },
                { DemographicSchemaColumns.Salt, 1 }
            };
        }

        public DemographicSchemaMapper Map(string column)
        {
            if (!check.TryGetValue(column, out ColumnValidationContext ctx))
            {
                errors.Add($"{column} is missing");
                return this;
            }
            var dbColumnType = ctx.Column.DataTypeName;
            if (!DemographicSchemaColumns.Types.TryGetValue(dbColumnType, out string mappedType))
            {
                errors.Add($"{column} type {dbColumnType} is unsupported for demographic");
                return this;
            }

            var fieldType = ctx.Field.Type;
            if (!fieldType.Equals(mappedType, StringComparison.InvariantCultureIgnoreCase))
            {
                errors.Add($"{column} must map to {fieldType} not {mappedType}");
            }

            schema.Add(column, ctx.Column.ColumnOrdinal.Value);
            return this;
        }

        public DemographicSchema Schema()
        {
            if (errors.Count > 0)
            {
                var errs = string.Join(", ", errors);
                throw new DemographicSchemaException($"The demographic query has the following errors: {errs}.");
            }

            return schema;
        }

        static Dictionary<string, ColumnValidationContext> GetIntermediate(SqlFieldSelector[] fields, Dictionary<string, DbColumn> columns)
        {
            var temp = new Dictionary<string, ColumnValidationContext>();

            foreach (var field in fields)
            {
                if (columns.TryGetValue(field.Column, out var dbcolumn))
                {
                    temp.Add(field.Column, new ColumnValidationContext { Column = dbcolumn, Field = field });
                }
            }

            return temp;
        }
    }

    class ColumnValidationContext
    {
        public DbColumn Column { get; set; }
        public SqlFieldSelector Field { get; set; }
    }
}
