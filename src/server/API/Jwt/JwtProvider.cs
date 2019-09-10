// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using API.Authentication;
using API.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Model.Authentication;
using Model.Authorization;
using Model.Options;
using System.Threading.Tasks;

namespace API.Jwt
{
    /// <summary>
    /// Produces RSA+SHA512 signed Jwt tokens.
    /// </summary>
    public class JwtProvider : IUserJwtProvider, IApiJwtProvider
    {
        readonly AuthenticationOptions authenticationOptions;
        readonly JwtSigningOptions jwtOptions;
        readonly LeafVersionOptions versionOptions;
        readonly IFederatedEntitlementProvider entitlementService;
        readonly IFederatedIdentityProvider idProvider;
        readonly ILoginSaver saver;

        string Timestamp => DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

        public JwtProvider(
            IOptions<JwtSigningOptions> signingOpts,
            IOptions<AuthenticationOptions> authOpts,
            IOptions<LeafVersionOptions> versionOpts,
            IFederatedIdentityProvider identityService,
            IFederatedEntitlementProvider entitlementService,
            ILoginSaver saver
        )
        {
            jwtOptions = signingOpts.Value;
            authenticationOptions = authOpts.Value;
            versionOptions = versionOpts.Value;
            this.idProvider = identityService;
            this.entitlementService = entitlementService;
            this.saver = saver;
        }

        public async Task<string> IdToken(HttpContext context)
        {
            var identity = idProvider.GetIdentity(context);
            var entitlement = entitlementService.GetEntitlement(context, identity);

            var claims = IdClaims(identity, entitlement);

            await saver.SaveLogin(new LoginEvent(identity, jwtOptions.Issuer, claims));

            return CreateToken(claims, expireMinutes: authenticationOptions.SessionTimeoutMinutes);
        }

        List<Claim> IdClaims(IScopedIdentity identity, Entitlement entitlement)
        {
            if (!entitlement.Mask.HasFlag(RoleMask.User))
            {
                throw new LeafAuthenticationException($"{identity.Identity} is not a Leaf user.");
            }

            var idNonce = Guid.NewGuid().ToString();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, identity.ScopedIdentity),
                IssuedAt,
                new Claim(JwtRegisteredClaimNames.Aud, jwtOptions.Issuer),
                new Claim(TokenType.Key, TokenType.Id),
                new Claim(Nonce.Id, idNonce),
                new Claim(AuthType.Key, authenticationOptions.Mechanism.ToString()),
                new Claim(LeafVersion.Key, versionOptions.Version.ToString())
            };

            claims.AddRange(GetRoles(entitlement));
            claims.AddRange(GetGroups(entitlement));

            return claims;
        }

        public string AccessToken(HttpContext context)
        {
            var user = context.User;

            var claims = AccessClaims(user);

            return CreateToken(claims, expireMinutes: 6);
        }

        List<Claim> AccessClaims(ClaimsPrincipal user)
        {
            var claims = user.Claims
                             .Where(CarryOver)
                             .ToList();

            claims.Add(IssuedAt);
            claims.Add(new Claim(TokenType.Key, TokenType.Access));

            return claims;
        }

        public string AccessToken(HttpContext context, Attestation attestation)
        {
            var user = context.User;

            var claims = AccessClaims(user, attestation);

            return CreateToken(claims, expireMinutes: 6);
        }

        List<Claim> AccessClaims(ClaimsPrincipal user, Attestation attestation)
        {
            var claims = user.Claims
                             .Where(CarryOver)
                             .ToList();

            var nonce = attestation.Nonce;
            if (nonce == null)
            {
                nonce = Guid.NewGuid().ToString();
            }

            claims.Add(IssuedAt);
            claims.Add(new Claim(TokenType.Key, TokenType.Access));
            claims.Add(new Claim(Nonce.Access, nonce));

            claims.Add(GetSessionType(attestation));
            claims.Add(GetDataClass(user, attestation));

            return claims;
        }

        readonly static string[] doNotCarryOver =
        {
            JwtRegisteredClaimNames.Iat,
            JwtRegisteredClaimNames.Exp,
            TokenType.Key
        };

        bool CarryOver(Claim c)
        {
            return !doNotCarryOver.Contains(c.Type);
        }

        public string ApiToken(int expireMinutes = 5)
        {
            var claims = ApiClaims();
            return CreateToken(claims, expireMinutes);
        }

        IEnumerable<Claim> ApiClaims()
        {
            return new List<Claim>
            {
                new Claim(TokenType.Key, TokenType.Api),
                IssuedAt,
                new Claim(JwtRegisteredClaimNames.Aud, jwtOptions.Issuer)
            };
        }

        IEnumerable<Claim> GetRoles(Entitlement entitlement)
        {
            var claims = new List<Claim>();
            var mask = entitlement.Mask;

            if (mask.HasFlag(RoleMask.Admin))
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Admin));
            }

            if (mask.HasFlag(RoleMask.Super))
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Super));
            }

            if (mask.HasFlag(RoleMask.Identified))
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Phi));
            }

            if (mask.HasFlag(RoleMask.Federated))
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Fed));
            }

            return claims;
        }

        Claim GetSessionType(Attestation attestation) => new Claim(Session.Key, attestation.SessionType == SessionType.QualityImprovement ? Session.QI : Session.Research);

        IEnumerable<Claim> GetGroups(Entitlement entitlement)
        {
            return entitlement.Groups.Select(g => new Claim(Group.Key, g));
        }

        Claim GetDataClass(ClaimsPrincipal user, Attestation attestation)
        {
            var data = (user.HasClaim(ClaimTypes.Role, Data.Identified) && attestation.IsIdentified) ? Data.Identified : Data.Deidentified;
            return new Claim(Data.Key, data);
        }

        Claim IssuedAt => new Claim(JwtRegisteredClaimNames.Iat, Timestamp, ClaimValueTypes.DateTime);

        string CreateToken(IEnumerable<Claim> claims, int expireMinutes)
        {
            var signingCert = new X509Certificate2(jwtOptions.Secret, jwtOptions.Password);
            var creds = new SigningCredentials(new X509SecurityKey(signingCert), SecurityAlgorithms.RsaSha512Signature);

            var token = new JwtSecurityToken(
                issuer: jwtOptions.Issuer,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
