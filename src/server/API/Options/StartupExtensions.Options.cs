// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
#if !DEBUG
#define RELEASE
#endif

using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using System.Diagnostics;
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

            // Runtime options
            services.ConfigureRuntimeOptions(configuration);

            // Compiler options
            services.ConfigureCompilerOptions(configuration);

            // Export Options
            services.ConfigureExportOptions(configuration);

            // Import Options
            services.ConfigureImportOptions(configuration);

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
            services.ConfigureJwtOptions(configuration);

            // Notification Options
            services.ConfigureNotificationOptions(configuration);

            // Obfuscation Options
            services.ConfigureObfuscationOptions(configuration);

            // Client options
            services.ConfigureClientOptions(configuration);

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

        static IServiceCollection ConfigureJwtOptions(this IServiceCollection services, IConfiguration config)
        {
            var keyPath = config.GetByProxy(Config.Jwt.SigningKey);
            var keyPass = config.GetByProxy(Config.Jwt.Password);
            var issuer = config.GetValue<string>(Config.Jwt.Issuer);
            var certPath = config.GetByProxy(Config.Jwt.Certificate);

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

        static IServiceCollection ConfigureExportOptions(this IServiceCollection services, IConfiguration config)
        {
            var rc = new REDCapExportOptions { Enabled = config.GetValue<bool>(Config.Export.REDCap.Enabled) };
            if (rc.Enabled)
            {
                rc.ApiURI = config.GetValue<string>(Config.Export.REDCap.ApiURI);
                rc.BatchSize = config.GetValue<int>(Config.Export.REDCap.BatchSize);
                rc.RowLimit = config.GetValue<int>(Config.Export.REDCap.RowLimit);
                rc.Scope = config.GetValue<string>(Config.Export.REDCap.Scope);
                rc.SuperToken = config.GetByProxy(Config.Export.REDCap.SuperToken);
            }

            services.Configure<REDCapExportOptions>(opts =>
            {
                opts.Enabled = rc.Enabled;
                opts.ApiURI = rc.ApiURI;
                opts.BatchSize = rc.BatchSize;
                opts.RowLimit = rc.RowLimit;
                opts.Scope = rc.Scope;
                opts.SuperToken = rc.SuperToken;
            });

            services.Configure<ExportOptions>(opts =>
            {
                opts.REDCap = rc;
            });

            return services;
        }

        static IServiceCollection ConfigureImportOptions(this IServiceCollection services, IConfiguration config)
        {
            var rc = new REDCapImportOptions { Enabled = config.GetValue<bool>(Config.Import.REDCap.Enabled) };
            if (rc.Enabled)
            {
                rc.ApiURI = config.GetValue<string>(Config.Import.REDCap.ApiURI);
                rc.BatchSize = config.GetValue<int>(Config.Import.REDCap.BatchSize);
            }

            services.Configure<REDCapImportOptions>(opts =>
            {
                opts.Enabled = rc.Enabled;
                opts.ApiURI = rc.ApiURI;
                opts.BatchSize = rc.BatchSize;
            });

            services.Configure<ImportOptions>(opts =>
            {
                opts.REDCap = rc;
            });

            return services;
        }

        static IServiceCollection ConfigureClientOptions(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<ClientOptions>(opts =>
            {
                // Map
                opts.Map.Enabled = config.GetValue<bool>(Config.Client.Map.Enabled);
                opts.Map.TileURI = config.GetValue<string>(Config.Client.Map.TileURI);

                // Visualize
                opts.Visualize.Enabled = config.GetValue<bool>(Config.Client.Visualize.Enabled);
                if (opts.Visualize.Enabled)
                {
                    var hasFedSet = config.TryGetValue(Config.Client.Visualize.ShowFederated, out bool showFed);
                    if (hasFedSet)
                    {
                        opts.Visualize.ShowFederated = showFed;
                    }
                }

                // Patient List
                opts.PatientList.Enabled = config.GetValue<bool>(Config.Client.PatientList.Enabled);

                // Help
                opts.Help.Enabled = config.GetValue<bool>(Config.Client.Help.Enabled);
                opts.Help.AutoSend = config.GetValue<bool>(Config.Notification.Enabled);
                opts.Help.Email = config.GetValue<string>(Config.Client.Help.Email);
                opts.Help.URI = config.GetValue<string>(Config.Client.Help.URI);
            });

            return services;
        }

        static IServiceCollection ConfigureNotificationOptions(this IServiceCollection services, IConfiguration config)
        {
            var notify = new NotificationOptions { Enabled = config.GetValue<bool>(Config.Notification.Enabled) };
            if (notify.Enabled)
            {
                var hasPort = config.TryGetValue(Config.Notification.Email.Port, out int port);
                var hasCred = config.TryGetValue(Config.Notification.Email.Credentials.Username, out string _);

                notify.Smtp.UseSSL = config.GetValue<bool>(Config.Notification.Email.UseSSL);
                notify.Smtp.Server = config.GetValue<string>(Config.Notification.Email.Server);
                notify.Smtp.Sender.Address = config.GetValue<string>(Config.Notification.Email.Sender.Address);
                notify.Smtp.Receiver.Address = config.GetValue<string>(Config.Notification.Email.Receiver.Address);

                if (hasPort)
                {
                    notify.Smtp.Port = port;
                }
                if (hasCred)
                {
                    notify.Smtp.Credentials.Username = config.GetByProxy(Config.Notification.Email.Credentials.Username);
                    notify.Smtp.Credentials.Password = config.GetByProxy(Config.Notification.Email.Credentials.Password);
                }

                services.Configure<NotificationOptions>(opts =>
                {
                    opts.Enabled = notify.Enabled;
                    opts.Smtp = notify.Smtp;
                });
            }

            return services;
        }

        static IServiceCollection ConfigureObfuscationOptions(this IServiceCollection services, IConfiguration config)
        {
            var log = services.BuildServiceProvider().GetRequiredService<ILogger<Startup>>();
            var obf = new ObfuscationOptions { Enabled = config.GetValue<bool>(Config.Obfuscation.Enabled) };

            if (obf.Enabled)
            {
                obf.Noise.Enabled = config.GetValue<bool>(Config.Obfuscation.Noise.Enabled);
                if (obf.Noise.Enabled)
                {
                    obf.Noise.LowerBound = config.GetValue<int>(Config.Obfuscation.Noise.LowerBound);
                    obf.Noise.UpperBound = config.GetValue<int>(Config.Obfuscation.Noise.UpperBound);

                    if (obf.Noise.LowerBound == 0 && obf.Noise.UpperBound == 0)
                    {
                        throw new LeafConfigurationException("Obfuscation Noise is enabled but Lower Bound and Upper Bound are both set to zero");
                    }
                }
                obf.LowCellSizeMasking.Enabled = config.GetValue<bool>(Config.Obfuscation.LowCellSizeMasking.Enabled);
                if (obf.LowCellSizeMasking.Enabled)
                {
                    obf.LowCellSizeMasking.Threshold = config.GetValue<int>(Config.Obfuscation.LowCellSizeMasking.Threshold);

                    if (obf.LowCellSizeMasking.Threshold <= 0)
                    {
                        throw new LeafConfigurationException($"Obfuscation Low Cell Size Masking must be greater than or equal to one, but is set to {obf.LowCellSizeMasking.Threshold}");
                    }
                }
                obf.RowLevelData.Enabled = config.GetValue<bool>(Config.Obfuscation.RowLevelData.Enabled);

                if (obf.RowLevelData.Enabled && obf.Noise.Enabled)
                {
                    log.LogWarning("Obfuscation Row Level Data is set to enabled, but Noise is also enabled, which prohibits all Row Level Data. If demographic or patient list data are requested an error will be thrown");
                }
                if (obf.RowLevelData.Enabled && obf.LowCellSizeMasking.Enabled)
                {
                    log.LogWarning("Obfuscation Row Level Data is set to enabled, but Low Cell Masking is also enabled, which prohibits all Row Level Data. If demographic or patient list data are requested an error will be thrown");
                }
            }
            services.Configure<ObfuscationOptions>(opts =>
            {
                opts.Enabled = obf.Enabled;
                opts.Noise = obf.Noise;
                opts.LowCellSizeMasking = obf.LowCellSizeMasking;
                opts.RowLevelData = obf.RowLevelData;
            });

            return services;
        }

        static IServiceCollection ConfigureRuntimeOptions(this IServiceCollection services, IConfiguration config)
        {
            var rt = new RuntimeOptions().WithRuntime(config.GetValue<string>(Config.Runtime.Mode));

            services.Configure<RuntimeOptions>(opts =>
            {
                opts.Runtime = rt.Runtime;
            });

            return services;
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
                opts.FieldPersonId = compilerOptions.FieldPersonId;
                opts.FieldEncounterId = compilerOptions.FieldEncounterId;

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
                    log.LogCritical("UNSECURED authentication detected, Leaf is not secured by authentication!");
                    ThrowInvalidUnsecuredEnvironment();
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

        [Conditional("RELEASE")]
        static void ThrowInvalidUnsecuredEnvironment()
        {
            throw new LeafConfigurationException("Do not run UNSECURED authentication in non-development environments!");
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
                    ThrowInvalidUnsecuredEnvironment();
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
