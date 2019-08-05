﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
using Model.Compiler.Common;

namespace Model.Compiler.SqlServer
{
    public class SqlServerCompiler : ISqlCompiler
    {
        readonly CompilerOptions compilerOptions;
        readonly CohortOptions cohortOptions;

        public SqlServerCompiler(
            IOptions<CompilerOptions> compilerOptions,
            IOptions<CohortOptions> cohortOptions)
        {
            this.compilerOptions = compilerOptions.Value;
            this.cohortOptions = cohortOptions.Value;
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
                    sql = new SubPanelSqlSet(panel, compilerOptions).ToString();
                    break;
                case PanelType.Sequence:
                    sql = new PanelSequentialSqlSet(panel, compilerOptions).ToString();
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

            foreach (var context in inclusions.Skip(1))
            {
                query.Append($" {Dialect.Syntax.INTERSECT} {context.CompiledQuery}");
            }

            foreach (var context in exclusions)
            {
                query.Append($" {Dialect.Syntax.EXCEPT} {context.CompiledQuery}");
            }

            return new CteCohortQuery(query.ToString());
        }

        string BuildWrappedPanelSql(Panel panel)
        {
            var internals = BuildPanelSql(panel);
            var alias = $"P{panel.Index}";
            return $"{Dialect.Syntax.SELECT} {alias}.{compilerOptions.FieldPersonId} {Dialect.Syntax.FROM} ( {internals} ) {Dialect.Syntax.AS} {alias}";
        }

        void ValidateSql(string input)
        {
            new SqlValidator(Dialect.IllegalCommands).Validate(input);
        }
    }
}
