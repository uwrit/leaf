// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using API.Authentication;
using API.Authorization;
using API.Jobs;
using API.Jwt;
using API.Middleware.Federation;
using API.Middleware.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Model.Admin;
using Model.Authentication;
using Model.Authorization;
using Model.Cohort;
using Model.Compiler;
using Model.Compiler.SqlServer;
using Model.Export;
using Model.Network;
using Model.Options;
using Model.Search;
using Services.Admin;
using Services.Authentication;
using Services.Authorization;
using Services.Cohort;
using Services.Export;
using Services.Network;
using Services.Search;

namespace API.Options
{
    public static partial class StartupExtensions
    {
        public static IServiceCollection RegisterLeafServices(
            this IServiceCollection services,
            Microsoft.AspNetCore.Hosting.IHostingEnvironment environment)
        {
            services.AddHttpContextAccessor();

            services.AddScoped<IUserContext, HttpUserContext>();
            services.AddTransient<UserContextLoggingMiddleware>();
            services.AddTransient<RejectIdentifiedFederationMiddleware>();

            services.AddScoped<IServerContext, HttpServerContext>();

            services.AddHttpClient<IREDCapExportService, REDCapExportService>(client =>
            {
                client.DefaultRequestHeaders.Add("Accept", "application/json");
                client.DefaultRequestHeaders.Add("Connection", "keep-alive");
            });

            services.AddIAMServices();

            services.AddTransient<ISqlCompiler, SqlServerCompiler>();

            services.AddTransient<INetworkEndpointService, NetworkEndpointService>();

            services.AddNetworkCache();

            services.AddSingleton<NetworkEndpointConcurrentQueueSet>();

            services.AddTransient<IJwtKeyResolver, JwtKeyResolver>();

            services.AddHttpClient<INetworkEndpointRefresher, NetworkEndpointRefresher>(client =>
            {
                client.DefaultRequestHeaders.Add("Accept", @"application/json");
            });

            if (environment.IsProduction())
            {
                services.AddHostedService<BackgroundCertificateSynchronizer>();
            }

            services.AddTransient<IConceptHintSearchService, ConceptHintSearchService>();

            services.AddTransient<IConceptTreeReader, ConceptTreeReader>();

            services.AddTransient<IPreflightConceptReader, PreflightResourceReader>();
            services.AddTransient<IPreflightResourceReader, PreflightResourceReader>();

            services.AddTransient<IPatientCohortService, CtePatientCohortService>();

            services.AddTransient<ICohortCacheService, CohortCacheService>();

            services.AddTransient<IDemographicSqlCompiler, DemographicSqlCompiler>();
            services.AddTransient<DemographicCompilerValidationContextProvider.ICompilerContextProvider, DemographicCompilerContextProvider>();
            services.AddTransient<IDemographicsExecutor, DemographicsExecutor>();

            services.AddTransient<IDatasetSqlCompiler, DatasetSqlCompiler>();
            services.AddTransient<DatasetCompilerValidationContextProvider.ICompilerContextProvider, DatasetCompilerContextProvider>();
            services.AddTransient<IDatasetQueryService, DatasetQueryService>();
            services.AddTransient<IDatasetExecutor, DatasetExecutor>();

            services.AddTransient<IQueryService, QueryService>();

            services.AddAdminServices();
            services.AddModel();

            return services;
        }

        // TODO(cspital) move into model
        static IServiceCollection AddModel(this IServiceCollection services)
        {
            services.AddTransient<NetworkValidator>();
            services.AddTransient<PanelValidator>();
            services.AddSingleton<PatientCountAggregator>();
            services.AddTransient<CohortCounter>();
            services.AddTransient<DemographicProvider>();
            services.AddTransient<DatasetProvider>();
            services.AddTransient<ConceptHintSearcher>();
            services.AddTransient<ConceptTreeSearcher>();
            services.AddTransient<PanelConverter>();
            services.AddTransient<PreflightResourceChecker>();
            services.AddTransient<DemographicCompilerValidationContextProvider>();
            services.AddTransient<DatasetCompilerValidationContextProvider>();

            return services;
        }

        static IServiceCollection AddAdminServices(this IServiceCollection services)
        {
            services.AddTransient<IAdminConceptSqlSetService, AdminConceptSqlSetService>();
            services.AddTransient<IAdminSpecializationService, AdminSpecializationService>();
            services.AddTransient<IAdminSpecializationGroupService, AdminSpecializationGroupService>();
            services.AddTransient<IAdminConceptService, AdminConceptService>();
            services.AddTransient<IAdminConceptEventService, AdminConceptEventService>();

            return services;
        }

        static IServiceCollection AddNetworkCache(this IServiceCollection services)
        {
            services.AddSingleton<INetworkEndpointCache, NetworkEndpointCache>(sp =>
            {
                var network = sp.GetService<INetworkEndpointService>();
                var initial = network.AllAsync().Result;

                return new NetworkEndpointCache(initial);
            });

            return services;
        }

        static IServiceCollection AddIAMServices(this IServiceCollection services)
        {
            services.AddSingleton<ITokenBlacklistCache, TokenBlacklistCache>();
            services.AddSingleton<ITokenBlacklistService, TokenBlacklistService>();
            services.AddHostedService<BackgroundTokenBlacklistSynchronizer>();

            var sp = services.BuildServiceProvider();
            var authenticationOptions = sp.GetRequiredService<IOptions<AuthenticationOptions>>().Value;
            services.AddAuthenticationServices(authenticationOptions);

            var authorizationOptions = sp.GetRequiredService<IOptions<AuthorizationOptions>>().Value;
            services.AddAuthorizationServices(authorizationOptions);

            services.AddTransient<IUserJwtProvider, JwtProvider>();
            services.AddTransient<IApiJwtProvider, JwtProvider>();

            return services;
        }

        static IServiceCollection AddAuthenticationServices(this IServiceCollection services, AuthenticationOptions opts)
        {
            switch (opts.Mechanism)
            {
                case AuthenticationMechanism.Saml2:
                    services.AddScoped<IFederatedIdentityProvider, SAML2IdentityProvider>();
                    break;

                case AuthenticationMechanism.Unsecured:
                    services.AddSingleton<IFederatedIdentityProvider, UnsecureIdentityProvider>();
                    break;
            }

            return services;
        }

        static IServiceCollection AddAuthorizationServices(this IServiceCollection services, AuthorizationOptions opts)
        {
            switch (opts.Mechanism)
            {
                case AuthorizationMechanism.Saml2:
                    services.AddSingleton<IFederatedEntitlementProvider, SAML2EntitlementProvider>();
                    break;

                case AuthorizationMechanism.ActiveDirectory:
                    services.AddSingleton<IMembershipProvider, ActiveDirectoryMembershipProvider>();
                    services.AddScoped<IFederatedEntitlementProvider, ActiveDirectoryEntitlementProvider>();
                    break;

                case AuthorizationMechanism.Unsecured:
                    services.AddSingleton<IFederatedEntitlementProvider, UnsecureEntitlementProvider>();
                    break;
            }

            return services;
        }
    }
}
