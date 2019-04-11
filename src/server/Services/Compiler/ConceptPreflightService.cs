// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Options;
using Model.Compiler;
using Services.Authorization;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using Microsoft.Extensions.Options;
using Services.Tables;
using Model.Authorization;

namespace Services.Compiler
{
    public class ConceptPreflightService : IConceptPreflightService
    {
        readonly IUserContext user;
        readonly ILogger<ConceptPreflightService> logger;
        readonly AppDbOptions dbOpts;

        public ConceptPreflightService(IUserContext userContext, ILogger<ConceptPreflightService> logger, IOptions<AppDbOptions> dbOpts)
        {
            user = userContext;
            this.logger = logger;
            this.dbOpts = dbOpts.Value;
        }

        public async Task<IEnumerable<ConceptPreflightCheckResult>> CheckAsync(IEnumerable<ConceptRef> concepts)
        {
            if (user.IsInstutional)
            {
                return await InternalCheckAsync(concepts);
            }

            throw new InvalidOperationException("Concept preflight checks from federated users disallowed.");
        }

        async Task<IEnumerable<ConceptPreflightCheckResult>> InternalCheckAsync(IEnumerable<ConceptRef> concepts)
        {
            logger.LogInformation("Concept Preflight Check Internal. Concepts:{@Concepts}", concepts);
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                return await cn.QueryAsync<ConceptPreflightCheckResult>(
                    Sql.QueryInternal,
                    new { ids = ResourceIdTable.From(concepts.Select(c => c.Id.Value)), user = user.UUID, groups = GroupMembership.From(user) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOpts.DefaultTimeout
                );
            }
        }

        static class Sql
        {
            public const string QueryInternal = @"app.sp_InternalConceptPreflightCheck";
        }
    }
}
