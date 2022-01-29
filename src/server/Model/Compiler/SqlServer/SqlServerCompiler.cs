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
using Model.Compiler.Common;
using Model.Authorization;

namespace Model.Compiler.SqlServer
{
    public class SqlServerCompiler : ISqlCompiler
    {
        readonly IUserContext user;
        readonly CompilerOptions compilerOptions;
        readonly CohortOptions cohortOptions;

        public SqlServerCompiler(
            IUserContext userContext,
            IOptions<CompilerOptions> compilerOptions,
            IOptions<CohortOptions> cohortOptions)
        {
            this.user = userContext;
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

        public string BuildDatasetEncounterFilterSql(Panel panel)
        {
            var sql = new DatasetJoinedSqlSet(panel, compilerOptions).ToString();
            ValidateSql(sql);
            return sql;
        }

        public ISqlStatement BuildCteSql(IEnumerable<Panel> panels)
        {
            var parameters = BuildContextParameterSql();
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
                query.Append($" {SqlCommon.Syntax.INTERSECT} {context.CompiledQuery}");
            }

            foreach (var context in exclusions)
            {
                query.Append($" {SqlCommon.Syntax.EXCEPT} {context.CompiledQuery}");
            }

            return new CteCohortQuery(parameters, query.ToString());
        }

        public string BuildContextParameterSql()
        {
            Func<bool,int> toInt = (bool x) => Convert.ToInt32(x);
            var identified = $"{SqlCommon.Syntax.DECLARE} @IsIdentified {SqlCommon.Types.BIT} = {toInt(user.Identified)}";
            var research   = $"{SqlCommon.Syntax.DECLARE} @IsResearch   {SqlCommon.Types.BIT} = {toInt(user.SessionType == SessionType.Research)}";
            var qi         = $"{SqlCommon.Syntax.DECLARE} @IsQI         {SqlCommon.Types.BIT} = {toInt(user.SessionType == SessionType.QualityImprovement)}";
            return $"{identified}; {research}; {qi};";
        }

        string BuildWrappedPanelSql(Panel panel)
        {
            var internals = BuildPanelSql(panel);
            var alias = $"P{panel.Index}";
            return $"{SqlCommon.Syntax.SELECT} {alias}.{compilerOptions.FieldPersonId} {SqlCommon.Syntax.FROM} ( {internals} ) {SqlCommon.Syntax.AS} {alias}";
        }

        void ValidateSql(string input)
        {
            new SqlValidator(SqlCommon.IllegalCommands).Validate(input);
        }
    }
}
