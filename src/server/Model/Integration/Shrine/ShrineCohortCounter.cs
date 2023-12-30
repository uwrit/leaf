// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Options;
using Model.Integration.Shrine4_1;
using Model.Compiler;

namespace Model.Integration.Shrine
{
	public class ShrineCohortCounter
	{
        readonly ILogger<ShrineCohortCounter> log;
        readonly IUserContext user;
        readonly IShrineUserQueryCache userQueryCache;
        readonly IShrineQueryResultCache queryResultCache;
        readonly ShrineIntegrationOptions opts;

        public ShrineCohortCounter(
            ILogger<ShrineCohortCounter> log,
            IOptions<ShrineIntegrationOptions> opts,
            IUserContext user,
            IShrineUserQueryCache userQueryCache,
            IShrineQueryResultCache queryResultCache)
        {
            this.user = user;
            this.userQueryCache = userQueryCache;
            this.queryResultCache = queryResultCache;
            this.log = log;
            this.opts = opts.Value;
        }

        public ShrineRunQueryForResult SubmitQueryToShrine(ShrineQuery query)
        {
            return new ShrineRunQueryForResult
            {
                Query = query,
                Researcher = new ShrineResearcher
                {
                    Id = opts.Researcher.Id,
                    VersionInfo = query.VersionInfo,
                    UserName = opts.Researcher.Name,
                    UserDomainName = opts.Researcher.Domain,
                    NodeId = opts.Node.Id
                },
                Topic = new ShrineTopic
                {
                    Id = opts.Topic.Id,
                    VersionInfo = query.VersionInfo,
                    ResearcherId = opts.Researcher.Id,
                    Name = opts.Topic.Name,
                    Description = opts.Topic.Description
                },
                ProtocolVersion = 2
            };
        }
    }
}

