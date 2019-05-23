// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Options;
using Model.Options;
using Model.Admin.Network;
using System.Threading.Tasks;
using Model.Results;
using Model.Network;
using Dapper;
using System.Data.SqlClient;
using Services.Network;
using System.Data;

namespace Services.Admin.Network
{
    public class AdminNetworkEndpointUpdater : AdminNetworkEndpointManager.IAdminNetworkUpdater
    {
        readonly AppDbOptions opts;

        public AdminNetworkEndpointUpdater(
            IOptions<AppDbOptions> dbOptions)
        {
            opts = dbOptions.Value;
        }

        public async Task<UpdateResult<NetworkEndpoint>> UpdateEndpointAsync(NetworkEndpoint item)
        {
            var record = new NetworkEndpointRecord(item);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var old = await cn.QueryFirstOrDefaultAsync<NetworkEndpointRecord>(
                    Sql.UpdateEndpoint,
                    new
                    {
                        id = record.Id,
                        name = record.Name,
                        address = record.Address,
                        issuer = record.Issuer,
                        keyid = record.KeyId,
                        certificate = record.Certificate,
                        isResponder = record.IsResponder,
                        isInterrogator = record.IsInterrogator,
                        updated = record.Updated
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                return new UpdateResult<NetworkEndpoint>
                {
                    Old = old.NetworkEndpoint(),
                    New = item
                };
            }
        }

        public async Task<UpdateResult<NetworkIdentity>> UpdateIdentityAsync(NetworkIdentity identity)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var old = await cn.QueryFirstOrDefaultAsync<NetworkIdentity>(
                    Sql.UpsertIdentity,
                    new
                    {
                        name = identity.Name,
                        abbr = identity.Abbreviation,
                        desc = identity.Description,
                        totalPatients = identity.TotalPatients,
                        lat = identity.Latitude,
                        lng = identity.Longitude,
                        primColor = identity.PrimaryColor,
                        secColor = identity.SecondaryColor
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                if (old?.Name == null)
                {
                    old = null;
                }

                return new UpdateResult<NetworkIdentity>
                {
                    Old = old,
                    New = identity
                };
            }
        }

        public Task<NetworkEndpoint> CreateEndpointAsync(NetworkEndpoint endpoint)
        {
            throw new NotImplementedException();
        }

        public Task<NetworkEndpoint> DeleteEndpointAsync(int id)
        {
            throw new NotImplementedException();
        }

        static class Sql
        {
            public const string UpdateEndpoint = "adm.sp_UpdateEndpoint";
            public const string UpsertIdentity = "adm.sp_UpsertIdentity";
        }
    }
}
