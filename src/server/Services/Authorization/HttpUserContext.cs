// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Options;
using System.IdentityModel.Tokens.Jwt;

namespace Services.Authorization
{
    /// <summary>
    /// Provides an accessor to the current ClaimsPrincipal from the HttpContext.
    /// </summary>
    public class HttpUserContext : IUserContext
    {
        readonly ClaimsPrincipal user;
        readonly string issuer;
        public HttpUserContext(IHttpContextAccessor accessor, IOptions<JwtVerifyingOptions> jwtOptions)
        {
            user = accessor.HttpContext.User;
            issuer = jwtOptions.Value.Issuer;
            identifiedSet = false;
        }

        string[] groups;
        public string[] Groups
        {
            get
            {
                if (groups == null)
                {
                    var gs = user.FindAll(c => c.Type == Group.Key);
                    groups = gs.Select(g => g.Value).ToArray();
                }
                return groups;
            }
        }

        string[] roles;
        public string[] Roles
        {
            get
            {
                if (roles == null)
                {
                    var rs = user.FindAll(c => c.Type == ClaimTypes.Role);
                    roles = rs.Select(c => c.Value).ToArray();
                }
                return roles;
            }
        }

        public bool IsAdmin => user.IsInRole(Role.Admin) && IsInstutional;

        string username;
        string Username
        {
            get
            {
                if (username == null)
                {
                    username = user?.Identity?.Name;
                }
                return username;
            }
        }

        string iss;
        public string Issuer
        {
            get
            {
                if (iss == null)
                {
                    iss = user?.Claims?.SingleOrDefault(c => c.Type == JwtRegisteredClaimNames.Iss)?.Value;
                }
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
                    var i = Issuer;
                    var u = Username;
                    if (u != null && i != null)
                    {
                        uuid = $"{u}@{i}";
                    }
                }
                return uuid;
            }
        }

        public bool IsInstutional => Issuer == issuer;

        Guid idNonce;
        public Guid IdNonce
        {
            get
            {
                if (idNonce == default)
                {
                    idNonce = new Guid(user.FindFirst(c => c.Type == Nonce.Id).Value);
                }
                return idNonce;
            }
        }

        Guid? sessionNonce;
        public Guid? SessionNonce
        {
            get
            {
                if (!sessionNonce.HasValue)
                {
                    var nonce = user.FindFirst(c => c.Type == Nonce.Access)?.Value;
                    if (!string.IsNullOrWhiteSpace(nonce))
                    {
                        sessionNonce = new Guid(nonce);
                    }
                }
                return sessionNonce;
            }
        }

        bool identifiedSet;
        bool identified;
        public bool Identified
        {
            get
            {
                if (identifiedSet == false)
                {
                    var dataClass = user?.FindFirst(c => c.Type == Data.Key)?.Value;
                    identified = !string.IsNullOrWhiteSpace(dataClass) && dataClass == Data.Identified;
                    identifiedSet = true;
                }
                return identified;
            }
        }

        AuthenticationMechanism? authenticationMechanism;
        public AuthenticationMechanism AuthenticationMechanism
        {
            get
            {
                if (!authenticationMechanism.HasValue)
                {
                    var mechanism = user.FindFirst(c => c.Type == AuthType.Key).Value;
                    authenticationMechanism = mechMap[mechanism];
                }
                return authenticationMechanism.Value;
            }
        }
        readonly static Dictionary<string, AuthenticationMechanism> mechMap = new Dictionary<string, AuthenticationMechanism>
        {
            { AuthenticationMechanism.Unsecured.ToString(), AuthenticationMechanism.Unsecured },
            { AuthenticationMechanism.ActiveDirectory.ToString(), AuthenticationMechanism.ActiveDirectory },
            { AuthenticationMechanism.Saml2.ToString(), AuthenticationMechanism.Saml2 },
        };

        public override string ToString() => UUID;
    }
}
