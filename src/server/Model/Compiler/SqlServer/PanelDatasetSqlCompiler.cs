// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Options;
using Model.Compiler.Common;
using Model.Options;

namespace Model.Compiler.SqlServer
{
    public class PanelDatasetSqlCompiler : IPanelDatasetSqlCompiler
    {
        readonly CompilerOptions compilerOptions;

        public PanelDatasetSqlCompiler(IOptions<CompilerOptions> compOpts)
        {
            this.compilerOptions = compOpts.Value;
        }

        public ConceptDatasetExecutionContext BuildPanelDatasetSql(PanelDatasetCompilerContext compilerContext)
        {
            var query = new DatasetNonAggregateJoinedSqlSet(compilerContext.Panel, compilerOptions).ToString();
            new SqlValidator(SqlCommon.IllegalCommands).Validate(query);

            var exeContext = new ConceptDatasetExecutionContext(compilerContext.QueryContext, compilerContext.QueryContext.QueryId);
            exeContext.AddParameter(ShapedDatasetCompilerContext.QueryIdParam, compilerContext.QueryContext.QueryId);
            exeContext.CompiledQuery = query;

            return exeContext;
        }
    }
}