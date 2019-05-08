// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Network;
using System.Data;
using System.Data.SqlClient;
using Dapper;
using System.Linq;
using Model.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Services.Extensions;

namespace Services.Network
{
    public class NetworkEndpointService : INetworkEndpointService
    {
        const string queryGetIdentity = "network.sp_GetIdentity";
        const string queryGetWithIdentity = "network.sp_GetIdentityEndpoints";
        const string queryGet = "network.sp_GetEndpoints";
        const string queryGetSince = "network.sp_GetEndpointsUpdatedAfter";
        const string queryCreate = "network.sp_CreateEndpoint";
        const string queryDelete = "network.sp_DeleteEndpointById";
        const string queryUpdate = "network.sp_UpdateEndpoint";

        readonly AppDbOptions opts;
        readonly NetworkValidator validator;
        readonly ILogger<NetworkEndpointService> log;

        public NetworkEndpointService(
            IOptions<AppDbOptions> dbOptions,
            NetworkValidator networkValidator,
            ILogger<NetworkEndpointService> logger)
        {
            opts = dbOptions.Value;
            validator = networkValidator;
            log = logger;
        }

        public async Task<IEnumerable<NetworkEndpoint>> AllAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var ners = await cn.QueryAsync<NetworkEndpointRecord>(
                    queryGet,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure);

                var nrs = ValidateRespondents(ners);

                return nrs;
            }
        }

        public async Task<NetworkIdentityEndpoints> AllWithIdentityAsync()
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

                var nes = ValidateRespondents(records);

                return new NetworkIdentityEndpoints
                {
                    Identity = identity,
                    Endpoints = nes
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

        public async Task UpdateAsync(NetworkEndpoint item)
        {
            validator.Validate(item);

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

                log.LogInformation("Updated NetworkEndpoint. Old:{@Old} New:{@New}", old, item);
            }
        }

        IEnumerable<NetworkEndpoint> ValidateRespondents(IEnumerable<NetworkEndpointRecord> records)
        {
            var ok = new List<NetworkEndpoint>();
            foreach (var rec in records)
            {
                try
                {
                    var nr = rec.NetworkEndpoint();
                    validator.Validate(nr);

                    ok.Add(nr);
                }
                catch (UriFormatException ue)
                {
                    log.LogError("NetworkEndpoint is invalid. Endpoint:{@Endpoint} Error:{Error}", rec, ue.Message);
                }
            }
            return ok;
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
                Certificate = Convert.FromBase64String(Certificate)
            };
        }
    }
}
