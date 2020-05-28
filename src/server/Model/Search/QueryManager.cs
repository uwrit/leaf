// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Compiler;
using Model.Extensions;
using Model.Search;
using Model.Tagging;
using Model.Error;
using System.Data.Common;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Model.Search
{
    public class QueryManager
    {
        readonly IQueryService service;
        readonly ILogger<QueryManager> log;
        readonly IUserContext user;
        readonly ObfuscationOptions obfuscationOptions;
        readonly PanelConverter converter;
        readonly PanelValidator validator;

        bool shouldHideCountChecked = false;
        bool shouldHideCount = false;
        bool HideCount
        {
            get 
            { 
                if (!shouldHideCountChecked)
                {
                    shouldHideCount = obfuscationOptions.Enabled && (obfuscationOptions.Noise.Enabled || obfuscationOptions.LowCellSizeMasking.Enabled);
                    shouldHideCountChecked = true;
                }
                return shouldHideCount;
            }
        }

        public QueryManager(
            IQueryService service,
            IOptions<ObfuscationOptions> obfuscationOptions,
            ILogger<QueryManager> log,
            IUserContext user,
            PanelConverter converter,
            PanelValidator validator)
        {
            this.service = service;
            this.obfuscationOptions = obfuscationOptions.Value;
            this.log = log;
            this.user = user;
            this.converter = converter;
            this.validator = validator;
        }

        public async Task<IEnumerable<BaseQuery>> GetQueriesAsync()
        {
            log.LogInformation("Getting queries");
            var queries = await service.GetQueriesAsync();
            if (HideCount)
            {
                queries = queries.ToList();
                foreach (var query in queries)
                {
                    query.Count = null;
                }
            }
            return queries;
        }

        public async Task<Query> GetQueryAsync(QueryUrn urn)
        {
            log.LogInformation("Getting query. UId:{UId}", urn);
            try
            {
                var query = await service.GetQueryAsync(urn);
                if (query == null)
                {
                    log.LogError("Could not find query. UId:{UId}", urn);
                }
                else
                {
                    log.LogInformation("Found query. Id:{Id} UId:{UId}", query.Id, query.UniversalId);
                }
                if (HideCount)
                {
                    query.Count = null;
                }
                return query;
            }
            catch (DbException de)
            {
                log.LogError("Failed to get query. UniversalId:{UniversalId} Code:{Code} Error:{Error}", urn, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<QueryDeleteResult> DeleteAsync(QueryUrn urn, bool force)
        {
            log.LogInformation("Deleting query. Query:{Query} Force:{Force}", urn, force);
            try
            {
                var result = await service.DeleteAsync(urn, force);
                if (result.Ok)
                {
                    log.LogInformation("Deleted query. Query:{Query}", urn);
                }
                else
                {
                    log.LogInformation("Could not delete query due to conflict. Query:{Query} Result:{@Result}", urn, result);
                }
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete query. Query:{Query} Code:{Code} Error:{Error}", urn, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<SaveResult> SaveAsync(Guid id, IQuerySaveDTO ast, Func<IQueryDefinition, string> json, CancellationToken cancel)
        {
            log.LogInformation("Saving query. Id:{Id} Ast:{Ast}", id, ast);

            var ctx = await converter.GetPanelsAsync(ast, cancel);
            log.LogInformation("Save query panel validation context. Context:{@Context}", ctx);

            if (!ctx.PreflightPassed)
            {
                return new SaveResult { State = SaveState.Preflight, Preflight = ctx.PreflightCheck };
            }
            var query = validator.Validate(ctx);

            cancel.ThrowIfCancellationRequested();

            if (!user.IsInstitutional)
            {
                converter.LocalizeDefinition(ast, query);
                log.LogInformation("Localized federated query. Id:{Id} Ast:{Ast}", id, ast);
            }

            var toSave = new QuerySave
            {
                QueryId = id,
                UniversalId = ctx.UniversalId,
                Name = ast.Name,
                Category = ast.Category,
                Definition = json(ast),
                Resources = query.Panels.GetResources()
            };

            // if ast already has an assive version, use it
            if (ast.Ver.HasValue)
            {
                toSave.Ver = ast.Ver.Value;
            }

            try
            {

                log.LogInformation("Saving query. Query:{Query} Payload:{@Payload}", id, toSave);

                var saved = await ImplSaveAsync(toSave);
                if (saved == null)
                {
                    log.LogError("Could not save query, not found. Query:{Query}", id);
                    return new SaveResult
                    {
                        State = SaveState.NotFound,
                        Preflight = ctx.PreflightCheck,
                        Result = null
                    };
                }
                log.LogInformation("Saved query. Query:{@Query}", toSave);
                return new SaveResult
                {
                    State = SaveState.Ok,
                    Preflight = ctx.PreflightCheck,
                    Result = saved
                };
            }
            catch (DbException de)
            {
                log.LogError("Failed to save query. Query:{@Query} Code:{Code} Error:{Error}", toSave, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        async Task<QuerySaveResult>  ImplSaveAsync(QuerySave query)
        {
            if (query.UniversalId == null)
            {
                return await service.InitialSaveAsync(query);
            }
            return await service.UpsertSaveAsync(query);
        }

        public class SaveResult
        {
            public SaveState State { get; set; }
            public PreflightResources Preflight { get; set; }
            public QuerySaveResult Result { get; set; }
        }

        public enum SaveState
        {
            Ok,
            Preflight,
            NotFound
        }
    }
}
