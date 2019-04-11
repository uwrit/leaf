// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Dapper;
using Model.Compiler;
using Model.Options;
using Services.Authorization;
using System.Security.Claims;
using Services.Extensions;
using Services.Tables;
using Model.Authorization;

namespace Services.Compiler
{
    /// <summary>
    /// User aware concept hint search engine.
    /// Implements ISearch for ConceptHint.
    /// </summary>
    public class ConceptHintSearchEngine : IConceptHintSearchEngine
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;
        readonly ILogger<ConceptHintSearchEngine> log;

        public ConceptHintSearchEngine(IOptions<AppDbOptions> dbOptions, IUserContext userContext, ILogger<ConceptHintSearchEngine> logger)
        {
            opts = dbOptions.Value;
            log = logger;
            user = userContext;
        }

        /// <summary>
        /// Search the GEM (General Equivalence Mapping, published by CMS) for possible ICD9-10 or ICD10->9 equivalent code />
        /// </summary>
        /// <returns>A possible equivalent code to that entered</returns>
        /// <param name="term">Search term.</param>
        public async Task<ConceptEquivalentHint> SearchEquivalentAsync(string term)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var equivalent = await cn.QueryFirstOrDefaultAsync<ConceptEquivalentHint>(
                    Sql.QueryEquivalent,
                    new
                    {
                        source = term,
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return equivalent;
            }
        }

        /// <summary>
        /// Search the concept tree for records matching the provided terms, and stopping at the <paramref name="rootId"/>
        /// </summary>
        /// <returns>Collection of concepts that match the search terms</returns>
        /// <param name="rootId">Root parent identifier.</param>
        /// <param name="terms">Search terms.</param>
        public async Task<IEnumerable<ConceptHint>> SearchAsync(Guid? rootId, params string[] terms)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var records = await cn.QueryAsync<ConceptHintRecord>(
                    Sql.Query,
                    new
                    {
                        terms = SearchTermTable.From(terms),
                        rootId,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return records.Select(r => r.ConceptHint());
            }
        }

        static class Sql
        {
            public const string Query = @"app.sp_GetConceptHintsBySearchTerms";
            public const string QueryEquivalent = @"app.sp_GetGeneralEquivalenceMapping";
        }
    }
}
