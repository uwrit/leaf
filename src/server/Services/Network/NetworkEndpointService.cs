﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Network;
using Model.Options;
using Model.Results;

namespace Services.Network
{
    public class NetworkEndpointService : INetworkEndpointService
    {
        const string queryGetIdentity = "network.sp_GetIdentity";
        const string queryGetWithIdentity = "network.sp_GetIdentityEndpoints";
        const string queryGet = "network.sp_GetEndpoints";
        const string queryUpdate = "network.sp_UpdateEndpoint";

        readonly AppDbOptions opts;

        public NetworkEndpointService(
            IOptions<AppDbOptions> dbOptions)
        {
            opts = dbOptions.Value;
        }

        public async Task<IEnumerable<NetworkEndpoint>> GetEndpointsAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var ners = await cn.QueryAsync<NetworkEndpointRecord>(
                    queryGet,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                return ners.Select(e => e.NetworkEndpoint());
            }
        }

        public async Task<NetworkIdentityEndpoints> GetEndpointsWithIdentityAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryGetWithIdentity,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                var identity = grid.Read<NetworkIdentity>().FirstOrDefault();
                var records = grid.Read<NetworkEndpointRecord>();

                return new NetworkIdentityEndpoints
                {
                    Identity = identity,
                    Endpoints = records.Select(e => e.NetworkEndpoint())
                };
            }
        }

        public async Task<NetworkIdentity> GetIdentityAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                return await cn.QuerySingleOrDefaultAsync<NetworkIdentity>(
                    queryGetIdentity,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );
            }
        }

        // TODO(cspital) migrate to future admin service
        public async Task<UpdateResult<NetworkEndpoint>> UpdateAsync(NetworkEndpoint item)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var old = await cn.QueryFirstOrDefaultAsync<NetworkEndpointRecord>(
                    queryUpdate,
                    new
                    {
                        id = item.Id,
                        name = item.Name,
                        address = item.Address.AbsoluteUri,
                        issuer = item.Issuer,
                        keyid = item.KeyId,
                        certificate = item.Certificate
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
    }

    class NetworkEndpointRecord
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Address { get; set; }

        public string Issuer { get; set; }

        public string KeyId { get; set; }

        public string Certificate { get; set; }

        public bool IsInterrogator { get; set; }

        public bool IsResponder { get; set; }

        public NetworkEndpointRecord()
        {

        }

        public NetworkEndpointRecord(NetworkEndpoint ne)
        {
            Id = ne.Id;
            Name = ne.Name;
            Address = ne.Address.AbsoluteUri;
            Issuer = ne.Issuer;
            KeyId = ne.KeyId;
            Certificate = Convert.ToBase64String(ne.Certificate);
            IsInterrogator = ne.IsInterrogator;
            IsResponder = ne.IsResponder;
        }

        public NetworkEndpoint NetworkEndpoint()
        {
            return new NetworkEndpoint
            {
                Id = Id,
                Name = Name,
                Address = new Uri(Address),
                Issuer = Issuer,
                KeyId = KeyId,
                Certificate = Convert.FromBase64String(Certificate),
                IsInterrogator = IsInterrogator,
                IsResponder = IsResponder
            };
        }
    }
}
