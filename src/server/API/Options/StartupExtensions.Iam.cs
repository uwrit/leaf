// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Model.Authorization;
using Model.Network;
using Model.Options;
using Services.Network;
using API.Jwt;

namespace API.Options
{
    public static partial class StartupExtensions
    {
        public static IServiceCollection ConfigureIdentityAccess(this IServiceCollection services)
        {
            var sp = services.BuildServiceProvider();
            var jwtOpts = sp.GetService<IOptions<JwtVerifyingOptions>>().Value;
            var cache = sp.GetService<INetworkEndpointCache>();
            var resolver = sp.GetService<IJwtKeyResolver>();

            var issuers = cache.All().Select(ne => ne.Issuer).ToList();
            issuers.Add(jwtOpts.Issuer);

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opts =>
                {
                    opts.TokenValidationParameters = new TokenValidationParameters
                    {
                        RequireExpirationTime = true,
                        RequireSignedTokens = true,
                        ValidateLifetime = true,
                        ValidIssuers = issuers,
                        ValidateIssuer = true,
                        ValidAudiences = issuers,
                        ValidateAudience = true,
                        IssuerSigningKeyResolver = resolver.ResolveKey
                    };
                });

            //Access
            services.AddAuthorizationPolicies(jwtOpts.Issuer);

            return services;
        }

        static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services, string issuer)
        {
            services.AddAuthorization(opts =>
            {
                opts.AddPolicy(Role.Admin, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireRole(Role.Admin);
                    policy.RequireClaim(JwtRegisteredClaimNames.Iss, issuer);
                });

                opts.AddPolicy(Role.Super, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireRole(Role.Super);
                    policy.RequireClaim(JwtRegisteredClaimNames.Iss, issuer);
                });

                opts.AddPolicy(Access.Institutional, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim(JwtRegisteredClaimNames.Iss, issuer);
                });

                opts.AddPolicy(TokenType.Access, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim(TokenType.Key, TokenType.Access);
                });

                opts.AddPolicy(TokenType.Id, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim(TokenType.Key, TokenType.Id);
                });

                opts.AddPolicy(TokenType.Api, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim(TokenType.Key, TokenType.Api);
                });
            });

            return services;
        }
    }
}
