// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using API.Options;
using API.Middleware.Logging;
using API.Middleware.Federation;

namespace API
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IHostingEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.ConfigureLeafOptions(Configuration, Environment);
            services.RegisterLeafServices(Environment);
            services.ConfigureIdentityAccess();

            // Last step. Default all routes to allow authenticated users only.
            services
                .AddMvc(config =>
                {
                    var policy = new AuthorizationPolicyBuilder()
                                    .RequireAuthenticatedUser()
                                    .Build();
                    config.Filters.Add(new AuthorizeFilter(policy));
                })
                .AddJsonOptions(settings =>
                {
                    settings.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                    settings.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsProduction() || env.IsStaging())
            {
                app.UseHsts();
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors(builder =>
            {
                builder.WithOrigins("*");
                builder.WithHeaders("Accept", "Content-Type", "Origin", "Authorization");
                builder.WithMethods("POST", "GET", "OPTIONS");
            });

            app.UseAuthentication();

            // NOTE(cspital) Register HTTP Middleware here, in order of execution.
            app.UseUserContextLogging();
            app.UseRejectInvalidFederatedUserMiddleware();
            app.UseTokenBlacklistMiddleware();

            app.UseMvc();
        }
    }
}
