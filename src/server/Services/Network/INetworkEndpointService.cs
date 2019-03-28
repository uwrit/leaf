// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Network;

namespace Services.Network
{
    public interface INetworkEndpointService
    {
        Task<NetworkEndpoint> CreateAsync(NetworkEndpoint endpoint);
        Task<IEnumerable<NetworkEndpoint>> AllAsync();
        Task UpdateAsync(NetworkEndpoint endpoint);
        Task DeleteAsync(NetworkEndpoint endpoint);
        Task<NetworkIdentityEndpoints> AllWithIdentityAsync();
        Task<NetworkIdentity> GetIdentityAsync();
    }
}
