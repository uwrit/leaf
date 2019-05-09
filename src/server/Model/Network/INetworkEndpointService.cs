﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// TODO(cspital) migrate update to future admin service

namespace Model.Network
{
    public interface INetworkEndpointService
    {
        Task<IEnumerable<NetworkEndpoint>> AllAsync();
        Task UpdateAsync(NetworkEndpoint endpoint);
        Task<NetworkIdentityEndpoints> AllWithIdentityAsync();
        Task<NetworkIdentity> GetIdentityAsync();
    }

    public class NetworkEndpointProvider
    {
        readonly INetworkEndpointService service;

        public NetworkEndpointProvider(INetworkEndpointService service)
        {
            this.service = service;
        }
    }
}
