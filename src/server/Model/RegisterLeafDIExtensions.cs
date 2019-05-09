// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Microsoft.Extensions.DependencyInjection;
using Model.Network;
using Model.Compiler;
using Model.Cohort;
using Model.Search;

namespace Model
{
    public static class RegisterLeafDIExtensions
    {
        public static IServiceCollection RegisterLeafCore(this IServiceCollection services)
        {
            services.AddSingleton<NetworkValidator>();
            services.AddTransient<NetworkEndpointProvider>();
            services.AddTransient<AdminNetworkEndpointManager>();

            services.AddTransient<PanelValidator>();
            services.AddTransient<PanelConverter>();
            services.AddTransient<DemographicCompilerValidationContextProvider>();
            services.AddTransient<DatasetCompilerValidationContextProvider>();

            services.AddSingleton<PatientCountAggregator>();
            services.AddTransient<CohortCounter>();
            services.AddTransient<DemographicProvider>();
            services.AddTransient<DatasetProvider>();

            services.AddTransient<ConceptHintSearcher>();
            services.AddTransient<ConceptTreeSearcher>();
            services.AddTransient<PreflightResourceChecker>();
            services.AddTransient<DatasetQueryProvider>();

            return services;
        }
    }
}
