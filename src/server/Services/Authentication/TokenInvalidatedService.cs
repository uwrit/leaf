// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Authentication;
using Model.Options;
using Dapper;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Options;
using System.Collections.Generic;

namespace Services.Authentication
{
    public class TokenInvalidatedService : IInvalidatedTokenService
    {
        const string queryInvalidated = @"auth.sp_InvalidateToken";
        const string queryRefresh = @"auth.sp_RefreshInvalidatedTokenList";

        readonly AppDbOptions opts;
        readonly IInvalidatedTokenCache invalidatedCache;

        public TokenInvalidatedService(IOptions<AppDbOptions> dbOpts, IInvalidatedTokenCache invalidatedCache)
        {
            opts = dbOpts.Value;
            this.invalidatedCache = invalidatedCache;
        }

        public async Task Invalidate(InvalidatedToken token)
        {
            invalidatedCache.Invalidate(token);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                await cn.ExecuteAsync(
                    queryInvalidated,
                    new { idNonce = token.IdNonce, exp = token.Expires },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );
            }
        }

        public async Task<IEnumerable<InvalidatedToken>> GetInvalidated()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                return await cn.QueryAsync<InvalidatedToken>(
                    queryRefresh,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );
            }
        }
    }
}
