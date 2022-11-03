// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace Model.Options
{
    public class AuthenticationOptions
    {
        public const string Saml2 = @"SAML2";
        public const string Unsecured = @"UNSECURED";

        public static readonly IEnumerable<string> LocalMechanisms = new string[] { Unsecured };
        public static readonly IEnumerable<string> FederatedMechanisms = new string[] { Saml2 };
        public static readonly IEnumerable<string> ValidMechanisms = LocalMechanisms.Concat(FederatedMechanisms);

        public int SessionTimeoutMinutes { get; set; }
        public int InactiveTimeoutMinutes { get; set; }
        public AuthenticationMechanism Mechanism { get; set; }
        public LogoutOptions Logout = new LogoutOptions();

        static bool ValidMechanism(string mech) => ValidMechanisms.Contains(mech);
        public AuthenticationOptions WithMechanism(string value)
        {
            var tmp = value.ToUpper();
            if (!ValidMechanism(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a supported authentication mechanism");
            }

            switch (tmp)
            {
                case Saml2:
                    Mechanism = AuthenticationMechanism.Saml2;
                    break;
                default:
                    Mechanism = AuthenticationMechanism.Unsecured;
                    break;
            }

            return this;
        }

        public bool IsSaml2 => Mechanism == AuthenticationMechanism.Saml2;
        public bool IsUnsecured => Mechanism == AuthenticationMechanism.Unsecured;
    }

    public class SAML2AuthenticationOptions : IBindTarget
    {
        public const AuthenticationMechanism Mechanism = AuthenticationMechanism.Saml2;
        public SAML2AuthenticationHeaderMappingOptions Headers { get; set; }

        public bool DefaultEqual()
        {
            return Headers == null;
        }
    }

    public class LogoutOptions
    {
        public bool Enabled { get; set; }
        public Uri URI { get; set; }

        public LogoutOptions WithURI(string value)
        {
            URI = new Uri(value);
            return this;
        }
    }

    public class SAML2AuthenticationHeaderMappingOptions
    {
        public string ScopedIdentity { get; set; }
    }

    public enum AuthenticationMechanism
    {
        Unsecured = 0,
        Saml2 = 1
    }
}
