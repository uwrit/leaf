// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Options;
using Model.Extensions;
using Model.Options;
using Model.Compiler.SqlBuilder;
using Model.Authorization;

namespace Model.Compiler.PanelSqlCompiler
{
    public class PanelSqlCompiler : IPanelSqlCompiler
    {
        readonly IUserContext user;
        readonly ISqlDialect dialect;
        readonly CompilerOptions compilerOptions;

        public PanelSqlCompiler(
            IUserContextProvider userContextProvider,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOptions)
        {
            this.user = userContextProvider.GetUserContext();
            this.dialect = dialect;
            this.compilerOptions = compilerOptions.Value;
        }

        /// <summary>
        /// Builds the SQL statement for the given Panel
        /// </summary>
        /// <returns>The panel sql.</returns>
        /// <param name="panel">Panel.</param>
        public string BuildPanelSql(Panel panel)
        {
            string sql;

            switch (panel.PanelType)
            {
                case PanelType.Patient:
                    sql = new SubPanelSqlSet(panel, compilerOptions, dialect).ToString();
                    break;
                case PanelType.Sequence:
                    sql = new PanelSequentialSqlSet(panel, compilerOptions, dialect).ToString();
                    break;
                default:
                    return string.Empty;
            }
            ValidateSql(sql);
            return sql;
        }

        public ISqlStatement BuildCteSql(IEnumerable<Panel> panels)
        {
            var contexts = panels.Select((p, i) =>
            {
                return new CteCohortQueryContext
                {
                    Panel = p,
                    CompiledQuery = BuildWrappedPanelSql(p)
                };
            });

            var (inclusions, exclusions) = contexts.PartitionBy(c => c.IsInclusion)
                                                   .OrderBy(c => c.GetEstimatedCount());

            var query = new StringBuilder(inclusions.First().CompiledQuery);

            foreach (var context in inclusions.Skip(1)) query.Append($" {dialect.Intersect()} {context.CompiledQuery}");
            foreach (var context in exclusions)         query.Append($" {dialect.Except()} {context.CompiledQuery}");

            return new CteCohortQuery(query.ToString());
        }

        public IEnumerable<QueryParameter> BuildContextQueryParameters()
        {
            var parameters = new List<QueryParameter>();

            parameters.Add(new QueryParameter("IsIdentified", user.Identified));
            parameters.Add(new QueryParameter("IsResearch", user.SessionType == SessionType.Research));
            parameters.Add(new QueryParameter("IsQI", user.SessionType == SessionType.QualityImprovement));

            return parameters;
        }

        string BuildWrappedPanelSql(Panel panel)
        {
            var internals = BuildPanelSql(panel);
            var alias = $"P{panel.Index}";
            return $"SELECT {alias}.{compilerOptions.FieldPersonId} FROM ( {internals} ) AS {alias}";
        }

        void ValidateSql(string input)
        {
            new SqlValidator(SqlCommon.IllegalCommands).Validate(input);
        }
    }
}
