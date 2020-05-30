// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Network;
using Model.Options;

namespace API.DTO.Network
{
    public class NetworkIdentityRespondersDTO
    {
        public NetworkIdentityResponseDTO Identity { get; set; }
        public IEnumerable<NetworkResponderDTO> Responders { get; set; }

        public NetworkIdentityRespondersDTO()
        {

        }

        public NetworkIdentityRespondersDTO(NetworkIdentityEndpoints nie, RuntimeMode runtime)
        {
            Identity = new NetworkIdentityResponseDTO(nie.Identity, runtime);
            Responders = nie.Endpoints
                .Where(e => e.IsResponder)
                .Select(n => new NetworkResponderDTO(n));
        }
    }
}
