// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class AuthorizationOptions
    {
        public const string Unsecured = "UNSECURED";
        public const string Saml2 = @"SAML2";
        public const string ActiveDirectory = @"ACTIVEDIRECTORY";
        public const string AppDb = @"APPDB";

        public static readonly IEnumerable<string> DirectMechanisms = new string[] { Unsecured, ActiveDirectory, AppDb };
        public static readonly IEnumerable<string> PassiveMechanisms = new string[] { Saml2 };
        public static readonly IEnumerable<string> ValidMechanisms = DirectMechanisms.Concat(PassiveMechanisms);

        public AuthorizationMechanism Mechanism { get; set; }
        public bool AllowAllAuthenticatedUsers { get; set; }
        public bool UnsecuredIsAdmin { get; set; }

        static bool ValidMechanism(string mech) => ValidMechanisms.Contains(mech);
        public AuthorizationOptions WithMechanism(string value)
        {
            var tmp = value.ToUpper();
            if (!ValidMechanism(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a supported authorization mechanism");
            }

            switch (tmp)
            {
                case Saml2:
                    Mechanism = AuthorizationMechanism.Saml2;
                    break;
                case ActiveDirectory:
                    Mechanism = AuthorizationMechanism.ActiveDirectory;
                    break;
                case AppDb:
                    Mechanism = AuthorizationMechanism.AppDb;
                    break;
                default:
                    Mechanism = AuthorizationMechanism.Unsecured;
                    break;
            }

            return this;
        }

        public bool IsSaml2 => Mechanism == AuthorizationMechanism.Saml2;
        public bool IsActiveDirectory => Mechanism == AuthorizationMechanism.ActiveDirectory;
        public bool IsAppDb => Mechanism == AuthorizationMechanism.AppDb;
        public bool IsUnsecured => Mechanism == AuthorizationMechanism.Unsecured;
    }

    public enum AuthorizationMechanism
    {
        Unsecured = 0,
        ActiveDirectory = 1,
        Saml2 = 2,
        AppDb = 3
    }

    public class SAML2AuthorizationOptions : IBindTarget
    {
        public const AuthorizationMechanism Mechanism = AuthorizationMechanism.Saml2;
        public HeadersMappingOptions HeadersMapping { get; set; }
        public RolesMappingOptions RolesMapping { get; set; }

        public bool DefaultEqual()
        {
            return HeadersMapping == null && RolesMapping == null;
        }
    }

    public class ActiveDirectoryAuthorizationOptions : IBindTarget
    {
        public const AuthorizationMechanism Mechanism = AuthorizationMechanism.ActiveDirectory;
        public DomainConnectionOptions DomainConnection { get; set; }
        public RolesMappingOptions RolesMapping { get; set; }

        public bool DefaultEqual()
        {
            return DomainConnection == null && RolesMapping == null;
        }
    }

    public class DomainConnectionOptions : IBindTarget
    {
        public string Server { get; set; }
        public int SSLPort { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

        public bool DefaultEqual()
        {
            return Server == null &&
                SSLPort == 0 &&
                Username == null &&
                Password == null;
        }
    }

    public class HeadersMappingOptions
    {
        public HeaderDigestionOptions Entitlements { get; set; }
    }

    public class HeaderDigestionOptions
    {
        public string Name { get; set; }
        public string Delimiter { get; set; }
    }

    public class RolesMappingOptions
    {
        public string User { get; set; }
        public string Super { get; set; }
        public string Identified { get; set; }
        public string Admin { get; set; }
        public string Federated { get; set; }

        public IEnumerable<string> Roles
        {
            get
            {
                return new string[]
                {
                    User, Super, Identified, Admin, Federated
                };
            }
        }
    }
}
