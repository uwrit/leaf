// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using Model.Compiler;
using Model.Validation;
using System.Data.Common;

namespace Services.Extensions
{
    public static class SqlServerExtensions
    {
        public static SqlParameter[] SqlParameters(this ConceptDatasetExecutionContext ctx)
        {
            return ctx.Parameters.SqlParameters();
        }

        public static SqlParameter[] SqlParameters(this ShapedDatasetExecutionContext ctx)
        {
            return ctx.Parameters.SqlParameters();
        }

        public static SqlParameter SqlParameter(this QueryParameter p) => new SqlParameter(p.Name, p.Value);

        public static SqlParameter[] SqlParameters(this IEnumerable<QueryParameter> ps)
        {
            return ps.Select(p => p.SqlParameter()).ToArray();
        }

        /// <summary>
        /// Parameterizes a query with an IN clause and a list of values.
        /// </summary>
        /// <typeparam name="T">Any type that maps to a SQL primitive.</typeparam>
        /// <param name="cmd">Command to parameterize.</param>
        /// <param name="values">Values for the IN clause.</param>
        /// <param name="paramNameRoot">Name placeholder for IN contects.</param>
        /// <param name="start">suffix number starting point, really irrelevant.</param>
        /// <param name="sep">separator, defined by the SQL implementation.</param>
        /// <returns>Parameters added to the command</returns>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Security", "CA2100:Review SQL queries for security vulnerabilities")]
        public static SqlParameter[] AddArrayParameters<T>(this SqlCommand cmd, IEnumerable<T> values, string paramNameRoot, int start = 1, string sep = ", ")
        {
            var parameters = new List<SqlParameter>();
            var parameterNames = new List<string>();
            var paramNum = start;

            foreach (var value in values)
            {
                var name = $"@{paramNameRoot}{paramNum++}";
                parameterNames.Add(name);
                parameters.Add(cmd.Parameters.AddWithValue(name, value));
            }

            cmd.CommandText = cmd.CommandText.Replace("{" + paramNameRoot + "}", String.Join(sep, parameterNames));
            return parameters.ToArray();
        }

        public static string GetNullableString(this SqlDataReader reader, int index)
        {
            if (reader.IsDBNull(index))
            {
                return null;
            }
            return reader.GetString(index);
        }

        public static Guid? GetNullableGuid(this SqlDataReader reader, int index)
        {
            if (reader.IsDBNull(index))
            {
                return null;
            }
            return reader.GetGuid(index);
        }

        public static DateTime? GetNullableDateTime(this SqlDataReader reader, int index)
        {
            if (reader.IsDBNull(index))
            {
                return null;
            }
            return reader.GetDateTime(index);
        }

        public static bool? GetNullableBoolean(this SqlDataReader reader, int index)
        {
            if (reader.IsDBNull(index))
            {
                return null;
            }
            return reader.GetBoolean(index);
        }

        public static int? GetNullableInt(this SqlDataReader reader, int index)
        {
            if (reader.IsDBNull(index))
            {
                return null;
            }
            return reader.GetInt32(index);
        }

        public static object GetNullableObject(this SqlDataReader reader, int index)
        {
            if (reader.IsDBNull(index))
            {
                return null;
            }
            return reader.GetValue(index);
        }

        public static string GetNullableString(this SqlDataReader reader, int? index)
        {
            if (index.HasValue)
            {
                return reader.GetNullableString(index.Value);
            }
            return null;
        }

        public static Guid? GetNullableGuid(this SqlDataReader reader, int? index)
        {
            if (index.HasValue)
            {
                return reader.GetNullableGuid(index.Value);
            }
            return null;
        }

        public static DateTime? GetNullableDateTime(this SqlDataReader reader, int? index)
        {
            if (index.HasValue)
            {
                return reader.GetNullableDateTime(index.Value);
            }
            return null;
        }

        public static bool? GetNullableBoolean(this SqlDataReader reader, int? index)
        {
            if (index.HasValue)
            {
                return reader.GetNullableBoolean(index.Value);
            }
            return null;
        }

        public static int? GetNullableInt(this SqlDataReader reader, int? index)
        {
            if (index.HasValue)
            {
                return reader.GetNullableInt(index.Value);
            }
            return null;
        }

        public static object GetNullableObject(this SqlDataReader reader, int? index)
        {
            if (index.HasValue)
            {
                return reader.GetNullableObject(index.Value);
            }
            return null;
        }
    }
}
