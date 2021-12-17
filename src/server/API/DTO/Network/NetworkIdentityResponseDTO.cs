// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Network;
using Model.Options;

namespace API.DTO.Network
{
    public class NetworkIdentityResponseDTO
    {
        public string Name { get; set; }
        public string Abbreviation { get; set; }
        public string Description { get; set; }
        public int? TotalPatients { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }
        public RuntimeMode Runtime { get; set; }

        public NetworkIdentityResponseDTO()
        {

        }

        public NetworkIdentityResponseDTO(NetworkIdentity n, RuntimeMode runtime)
        {
            Name = n.Name;
            Abbreviation = n.Abbreviation;
            Description = n.Description;
            TotalPatients = n.TotalPatients;
            Latitude = n.Latitude;
            Longitude = n.Longitude;
            PrimaryColor = n.PrimaryColor;
            SecondaryColor = n.SecondaryColor;
            Runtime = runtime;
        }
    }
}
