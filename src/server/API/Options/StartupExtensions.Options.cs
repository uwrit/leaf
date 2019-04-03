// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Model.Options;
using Microsoft.Extensions.Options;
using Services.Startup;

namespace API.Options
{
    public static partial class StartupExtensions
    {
        public static IServiceCollection ConfigureLeafOptions(
            this IServiceCollection services,
            IConfiguration configuration,
            IHostingEnvironment environment)
        {
            // Leaf Version
            services.Configure<LeafVersionOptions>(opts =>
            {
                opts.Version = Config.Version;
            });

            services.ConfigureCompilerOptions(configuration);

            // Client options
            services.Configure<ClientOptions>(opts =>
            {
                opts.Map.Enabled = configuration.GetValue<bool>(Config.Client.Map.Enabled);
                opts.Map.TileURI = configuration.GetValue<string>(Config.Client.Map.TileURI);
                opts.Help.Enabled = configuration.GetValue<bool>(Config.Client.Help.Enabled);
                opts.Help.Email = configuration.GetValue<string>(Config.Client.Help.Email);
                opts.Help.URI = configuration.GetValue<string>(Config.Client.Help.URI);
            });

            // Export Options
            services.Configure<ExportOptions>(opts =>
            {
                // TODO(cspital) address this in the same way authorization type specific options are registered
                // REDCap
                opts.REDCap.ApiURI = configuration.GetValue<string>(Config.Export.REDCap.ApiURI);
                opts.REDCap.BatchSize = configuration.GetValue<int>(Config.Export.REDCap.BatchSize);
                opts.REDCap.RowLimit = configuration.GetValue<int>(Config.Export.REDCap.RowLimit);
                opts.REDCap.Scope = configuration.GetValue<string>(Config.Export.REDCap.Scope);
                opts.REDCap.SuperToken = configuration.GetByProxy(Config.Export.REDCap.SuperToken);
            });

            // Authentication Options
            services.ConfigureAuthenticationOptions(configuration);

            // Authorization Options
            services.ConfigureAuthorizationOptions(configuration);

            // Network Validation Options
            services.Configure<NetworkValidationOptions>(opts =>
            {
                opts.EnsureHttps = environment.IsStaging() || environment.IsProduction();
            });

            // Cohort Caching Options
            services.Configure<CohortOptions>(configuration.GetSection(Config.Cohort.Section));

            // Jwt Options
            var keyPath = configuration.GetByProxy(Config.Jwt.SigningKey);
            var keyPass = configuration.GetByProxy(Config.Jwt.Password);
            var issuer = configuration.GetValue<string>(Config.Jwt.Issuer);
            var certPath = configuration.GetByProxy(Config.Jwt.Certificate);

            var certBytes = File.ReadAllBytes(certPath);
            var cert = new X509SecurityKey(new X509Certificate2(certBytes));

            services.Configure<JwtSigningOptions>(opts =>
            {
                opts.Issuer = issuer;
                opts.Secret = File.ReadAllBytes(keyPath);
                opts.Password = keyPass;
            });

            services.Configure<JwtVerifyingOptions>(opts =>
            {
                opts.Issuer = issuer;
                opts.Certificate = certBytes;
                opts.KeyId = cert.KeyId;
            });

            return services;
        }

        static string GetByProxy(this IConfiguration configuration, string key)
        {
            if (configuration.TryGetValue<string>(key, out var lookup))
            {
                var value = Environment.GetEnvironmentVariable(lookup);
                if (string.IsNullOrEmpty(value))
                {
                    throw new LeafConfigurationException($"{lookup} environment variable is missing");
                }
                return value;
            }
            throw new LeafConfigurationException($"{key} configuration value is missing");
        }

        static bool TryGetByProxy(this IConfiguration configuration, string key, out string value)
        {
            value = null;
            if (configuration.TryGetValue<string>(key, out var lookup))
            {
                var env = Environment.GetEnvironmentVariable(lookup);
                if (env == null)
                {
                    return false;
                }
                value = env;
                return true;
            }
            return false;
        }

        static bool TryGetValue<T>(this IConfiguration configuration, string key, out T item)
        {
            item = default;
            var str = configuration[key];
            if (str == null)
            {
                return false;
            }
            item = configuration.GetValue<T>(key);
            return true;
        }

        static bool TryBind<T>(this IConfiguration configuration, string key, out T item) where T : IBindTarget, new()
        {
            item = new T();
            configuration.Bind(key, item);
            return !item.DefaultEqual();
        }

        static IServiceCollection ConfigureCompilerOptions(this IServiceCollection services, IConfiguration config)
        {
            // App Db Connection
            services.Configure<AppDbOptions>(opts =>
            {
                opts.ConnectionString = config.GetByProxy(Config.Db.App.Connection);
                opts.DefaultTimeout = config.GetValue<int>(Config.Db.App.DefaultTimeout);
            });

            // Clin Db Connection
            services.Configure<ClinDbOptions>(opts =>
            {
                opts.ConnectionString = config.GetByProxy(Config.Db.Clin.Connection);
                opts.DefaultTimeout = config.GetValue<int>(Config.Db.Clin.DefaultTimeout);
            });

            var extractor = new DatabaseExtractor();
            var sp = services.BuildServiceProvider();
            // SQL Compiler Options
            config.TryBind<CompilerOptions>(Config.Compiler.Section, out var compilerOptions);
            services.Configure<CompilerOptions>(opts =>
            {
                opts.Alias = compilerOptions.Alias;
                opts.SetPerson = compilerOptions.SetPerson;
                opts.SetEncounter = compilerOptions.SetEncounter;
                opts.FieldPersonId = compilerOptions.FieldPersonId;
                opts.FieldEncounterId = compilerOptions.FieldEncounterId;
                opts.FieldEncounterAdmitDate = compilerOptions.FieldEncounterAdmitDate;
                opts.FieldEncounterDischargeDate = compilerOptions.FieldEncounterDischargeDate;

                opts.AppDb = extractor.ExtractDatabase(sp.GetService<IOptions<AppDbOptions>>().Value);
                opts.ClinDb = extractor.ExtractDatabase(sp.GetService<IOptions<ClinDbOptions>>().Value);
            });
            return services;
        }

        static IServiceCollection ConfigureAuthenticationOptions(this IServiceCollection services, IConfiguration config)
        {
            var auth = GetAuthenticationOptions(config);

            services.Configure<AuthenticationOptions>(opts =>
            {
                opts.Mechanism = auth.Mechanism;
                opts.SessionTimeoutMinutes = auth.SessionTimeoutMinutes;
                opts.InactiveTimeoutMinutes = auth.InactiveTimeoutMinutes;
                opts.LogoutURI = auth.LogoutURI;

            });

            switch (auth.Mechanism)
            {
                case AuthenticationMechanism.Unsecured:
                    var log = services.BuildServiceProvider().GetRequiredService<ILogger<Startup>>();
                    log.LogCritical("UNSECURED authentication detected, Leaf is not secured by authentication or authorization!");
                    break;

                case AuthenticationMechanism.Saml2:
                    if (!config.TryBind<SAML2AuthenticationOptions>(Config.Authentication.SAML2, out var saml2))
                    {
                        throw new LeafConfigurationException($"SAML2 authentication mechanism is missing a SAML2 authentication configuration object");
                    }
                    services.Configure<SAML2AuthenticationOptions>(opts =>
                    {
                        opts.Headers = saml2.Headers;
                    });
                    break;
            }

            return services;
        }

        static AuthenticationOptions GetAuthenticationOptions(IConfiguration config)
        {
            try
            {
                var auth = new AuthenticationOptions().WithMechanism(config.GetValue<string>(Config.Authentication.Mechanism));

                if (!config.TryGetValue<int>(Config.Authentication.SessionTimeout, out var session))
                {
                    if (!auth.IsUnsecured)
                    {
                        throw new LeafConfigurationException($"{Config.Authentication.SessionTimeout} is required for all secure authentication types");
                    }
                }
                auth.SessionTimeoutMinutes = session;

                if (!config.TryGetValue<string>(Config.Authentication.LogoutURI, out var logout))
                {
                    if (!auth.IsUnsecured)
                    {
                        throw new LeafConfigurationException($"{Config.Authentication.LogoutURI} is required for all secure authentication types");
                    }
                }
                if (!string.IsNullOrWhiteSpace(logout))
                {
                    auth.LogoutURI = new Uri(logout);
                }

                if (!config.TryGetValue<int>(Config.Authentication.InactivityTimeout, out var inactive))
                {
                    if (!auth.IsUnsecured)
                    {
                        throw new LeafConfigurationException($"{Config.Authentication.InactivityTimeout} is required for all secure authentication types");
                    }
                }
                auth.InactiveTimeoutMinutes = inactive;

                return auth;
            }
            catch (UriFormatException)
            {
                throw new LeafConfigurationException($"{Config.Authentication.LogoutURI} must be a valid URI");
            }
        }

        static IServiceCollection ConfigureAuthorizationOptions(this IServiceCollection services, IConfiguration config)
        {
            var sp = services.BuildServiceProvider();
            var log = sp.GetRequiredService<ILogger<Startup>>();
            var authentication = sp.GetRequiredService<IOptions<AuthenticationOptions>>().Value;
            var authorization = new AuthorizationOptions().WithMechanism(config.GetValue<string>(Config.Authorization.Mechanism));
            services.Configure<AuthorizationOptions>(opts =>
            {
                opts.Mechanism = authorization.Mechanism;
            });

            switch (authorization.Mechanism)
            {
                case AuthorizationMechanism.Unsecured:
                    if (!authentication.IsUnsecured)
                    {
                        throw new LeafConfigurationException($"{AuthorizationOptions.Unsecured} authorization mechanism is only supported if {Config.Authentication.Mechanism} is also {AuthenticationOptions.Unsecured}");
                    }
                    log.LogCritical("UNSECURED authorization detected, Leaf is not secured by authorization!");
                    break;

                case AuthorizationMechanism.Saml2:
                    if (!authentication.IsSaml2)
                    {
                        throw new LeafConfigurationException($"{AuthorizationOptions.Saml2} authorization mechanism is only supported if {Config.Authentication.Mechanism} is also {AuthenticationOptions.Saml2}");
                    }

                    if (!config.TryBind<SAML2AuthorizationOptions>(Config.Authorization.Saml2, out var saml2))
                    {
                        throw new LeafConfigurationException($"SAML2 authorization mechanism is missing a complete SAML2 configuration object");
                    }
                    Config.ThrowIfInvalid(saml2);

                    services.Configure<SAML2AuthorizationOptions>(opts =>
                    {
                        opts.RolesMapping = saml2.RolesMapping;
                        opts.HeadersMapping = saml2.HeadersMapping;
                    });
                    break;

                case AuthorizationMechanism.ActiveDirectory:
                    if (authentication.IsUnsecured)
                    {
                        throw new LeafConfigurationException($"ActiveDirectory authorization mechanism is not compatible with Unsecured authentication");
                    }
                    if (!config.TryBind<ActiveDirectoryAuthorizationOptions>(Config.Authorization.ActiveDirectory, out var ad))
                    {
                        throw new LeafConfigurationException($"ActiveDirectory authorization mechanism is missing an ActiveDirectory configuration section");
                    }
                    Config.ThrowIfInvalid(ad);

                    services.Configure<ActiveDirectoryAuthorizationOptions>(opts =>
                    {
                        opts.DomainConnection = ad.DomainConnection;
                        opts.RolesMapping = ad.RolesMapping;
                    });
                    break;
            }

            return services;
        }
    }
}
