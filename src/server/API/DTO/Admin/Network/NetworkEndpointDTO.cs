// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Network;

namespace API.DTO.Admin.Network
{
    public class NetworkEndpointDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Issuer { get; set; }
        public string KeyId { get; set; }
        public string Certificate { get; set; }
        public bool IsInterrogator { get; set; }
        public bool IsResponder { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
    }

    public static class NetworkEndpointExtensions
    {
        public static NetworkEndpoint NetworkEndpoint(this NetworkEndpointDTO dto)
        {
            if (dto == null) return null;
            return new NetworkEndpoint
            {
                Id = dto.Id,
                Name = dto.Name,
                Address = new Uri(dto.Address),
                Issuer = dto.Issuer,
                KeyId = dto.KeyId,
                Certificate = Convert.FromBase64String(dto.Certificate),
                IsInterrogator = dto.IsInterrogator,
                IsResponder = dto.IsResponder,
                Created = dto.Created,
                Updated = dto.Updated
            };
        }
    }
}
