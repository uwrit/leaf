// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Compiler;
using Model.Compiler.SqlServer;

namespace Model.Cohort
{
    /// <summary>
    /// Encapsulates Leaf's concept dataset extraction use case.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class ConceptDatasetProvider
    {
        public interface IConceptDatasetService
        {
            Task<ConceptDataset> GetConceptDatasetAsync(Panel panel, QueryRef queryRef);
        }

        readonly PanelConverter converter;
        readonly PanelValidator validator;
        readonly IConceptDatasetService conceptDatasetService;
        readonly ILogger<ConceptDatasetProvider> log;

        // Testing
        readonly IConceptDatasetSqlCompiler conceptDatasetSqlCompiler;

        public ConceptDatasetProvider(
            PanelConverter converter,
            PanelValidator validator,
            IConceptDatasetService conceptDatasetService,
            ILogger<ConceptDatasetProvider> log,

            IConceptDatasetSqlCompiler conceptDatasetSqlCompiler)
        {
            this.converter = converter;
            this.validator = validator;
            this.conceptDatasetService = conceptDatasetService;
            this.log = log;
            this.conceptDatasetSqlCompiler = conceptDatasetSqlCompiler;
        }

        public async Task<Result> GetConceptDatasetAsync(IQueryDefinition queryDef, QueryRef queryRef)
        {
            log.LogInformation("Concept Dataset extraction starting. Query:{@QueryDef}", queryDef);
            var ctx = await converter.GetPanelsAsync(queryDef);

            log.LogInformation("Concept Dataset validation context. Context:{@Context}", ctx);

            if (!ctx.PreflightPassed)
            {
                return new Result
                {
                    ValidationContext = ctx
                };
            }

            var query = validator.Validate(ctx);
            var x = conceptDatasetSqlCompiler.BuildConceptDatasetSql(queryRef, query.Panels.First());
            // conceptDatasetService.GetConceptDatasetAsync(query.Panels.First(), queryRef);

            return null;
        }

        public class Result
        {
            public PanelValidationContext ValidationContext { get; internal set; }
            public ConceptDataset Dataset { get; internal set; }
        }
    }
}
