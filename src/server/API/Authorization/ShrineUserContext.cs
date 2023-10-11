// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Authorization;
using Model.Options;
using Model.Integration.Shrine;

namespace API.Authorization
{
    public class ShrineUserContext : IUserContext
    {
        readonly ShrineResearcher researcher;

        public ShrineUserContext(ShrineResearcher researcher)
        {
            this.researcher = researcher;
        }

        public string[] Groups { get; } = Array.Empty<string>();

        public string[] Roles { get; } = new string[] { Role.Fed };

        public bool IsInRole(string role) => role == Role.Fed;

        public bool IsAdmin => false;

        public bool IsQuarantined => false;

        public string Identity => researcher.UserName;
        

        string iss;
        public string Issuer
        {
            get
            {
                iss ??= researcher.UserDomainName;
                return iss;
            }
        }

        string uuid;
        public string UUID
        {
            get
            {
                if (uuid == null)
                {
                    var issu = Issuer;
                    var id = Identity;
                    if (id != null && issu != null)
                    {
                        uuid = $"{id}@{issu}";
                    }
                }
                return uuid;
            }
        }

        public bool IsInstitutional => false;

        readonly Guid idNonce = Guid.NewGuid();
        public Guid IdNonce => idNonce;

        public SessionType SessionType => SessionType.Research;

        Guid? sessionNonce = Guid.NewGuid();
        public Guid? SessionNonce => sessionNonce;

        public bool Identified => false;

        public AuthenticationMechanism AuthenticationMechanism => AuthenticationMechanism.Unsecured;

        public override string ToString() => UUID;
    }
}

