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
using Model.Network;
using Dapper;
using System.Data.SqlClient;
using Services.Network;
using System.Data;
using Model.Authorization;

namespace Services.Admin.Network
{
    public class AdminNetworkEndpointUpdater : AdminNetworkEndpointManager.IAdminNetworkUpdater
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminNetworkEndpointUpdater(
            IOptions<AppDbOptions> dbOptions,
            IUserContext user)
        {
            opts = dbOptions.Value;
            this.user = user;
        }

        public async Task<NetworkEndpoint> UpdateEndpointAsync(NetworkEndpoint item)
        {
            var record = new NetworkEndpointRecord(item);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<NetworkEndpointRecord>(
                    Sql.UpdateEndpoint,
                    new
                    {
                        id = record.Id,
                        name = record.Name,
                        addr = record.Address,
                        iss = record.Issuer,
                        kid = record.KeyId,
                        cert = record.Certificate,
                        isResponder = record.IsResponder,
                        isInterrogator = record.IsInterrogator,
                        user = user.UUID
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                return updated.NetworkEndpoint();
            }
        }

        public async Task<NetworkIdentity> UpdateIdentityAsync(NetworkIdentity identity)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<NetworkIdentity>(
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
                        secColor = identity.SecondaryColor,
                        user = user.UUID
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                return updated;
            }
        }

        public async Task<NetworkEndpoint> CreateEndpointAsync(NetworkEndpoint endpoint)
        {
            var record = new NetworkEndpointRecord(endpoint);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var inserted = await cn.QueryFirstAsync<NetworkEndpointRecord>(
                    Sql.CreateEndpoint,
                    new
                    {
                        name = record.Name,
                        addr = record.Address,
                        iss = record.Issuer,
                        kid = record.KeyId,
                        cert = record.Certificate,
                        isInterrogator = record.IsInterrogator,
                        isResponder = record.IsResponder,
                        user = user.UUID
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                return inserted.NetworkEndpoint();
            }
        }

        public async Task<NetworkEndpoint> DeleteEndpointAsync(int id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<NetworkEndpointRecord>(
                    Sql.DeleteEndpoint,
                    new { id, user = user.UUID },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                return deleted.NetworkEndpoint();
            }
        }

        static class Sql
        {
            public const string DeleteEndpoint = "adm.sp_DeleteEndpoint";
            public const string CreateEndpoint = "adm.sp_CreateEndpoint";
            public const string UpdateEndpoint = "adm.sp_UpdateEndpoint";
            public const string UpsertIdentity = "adm.sp_UpsertIdentity";
        }
    }
}
