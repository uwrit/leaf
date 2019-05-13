// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using API.Middleware.Federation;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Options;
using Xunit;

namespace Tests
{
    public class RejectInvalidFederatedUserMiddlewareTests
    {
        [Fact]
        public void FederatedIdentified_Should_Be_True_If_Not_Institutional_And_Identified()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(id: true, ins: false), GetLogger());

            Assert.True(mw.FederatedIdentified);
        }

        [Fact]
        public void FederatedIdentified_Should_Be_False_If_Institutional_And_Identified()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(id: true, ins: true), GetLogger());

            Assert.False(mw.FederatedIdentified);
        }

        [Fact]
        public void FederatedIdentified_Should_Be_False_If_Not_Institutional_And_Not_Identified()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(id: false, ins: false), GetLogger());

            Assert.False(mw.FederatedIdentified);
        }

        [Fact]
        public void FederatedIdentified_Should_Be_False_If_Institutional_And_Not_Identified()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(id: false, ins: true), GetLogger());

            Assert.False(mw.FederatedIdentified);
        }

        [Fact]
        public void FederatedQuarantined_Should_Be_True_If_Not_Institutional_And_Quarantined()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(quar: true, ins: false), GetLogger());

            Assert.True(mw.FederatedQuarantined);
        }

        [Fact]
        public void FederatedQuarantined_Should_Be_False_If_Institutional_And_Quarantined()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(quar: true, ins: true), GetLogger());

            Assert.False(mw.FederatedQuarantined);
        }

        [Fact]
        public void FederatedQuarantined_Should_Be_False_If_Institutional_And_Not_Quarantined()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(quar: false, ins: true), GetLogger());

            Assert.False(mw.FederatedQuarantined);
        }

        [Fact]
        public void FederatedQuarantined_Should_Be_False_If_Not_Institutional_And_Not_Quarantined()
        {
            var mw = new RejectInvalidFederatedUserMiddleware(new FedIdMockUser(quar: false, ins: false), GetLogger());

            Assert.False(mw.FederatedQuarantined);
        }

        static readonly LoggerFactory factory = new LoggerFactory();
        static ILogger<RejectInvalidFederatedUserMiddleware> GetLogger() => new Logger<RejectInvalidFederatedUserMiddleware>(factory);

        class FedIdMockUser : IUserContext
        {
            public FedIdMockUser(bool id = false, bool quar = false, bool ins = true)
            {
                IsInstutional = ins;
                Identified = id;
                IsQuarantined = quar;
            }

            public string[] Groups => throw new NotImplementedException();

            public string[] Roles => throw new NotImplementedException();

            public string Issuer => throw new NotImplementedException();

            public string UUID => throw new NotImplementedException();

            public bool IsInstutional { get; }

            public bool IsAdmin => throw new NotImplementedException();

            public bool IsQuarantined { get; }

            public Guid IdNonce => throw new NotImplementedException();

            public Guid? SessionNonce => throw new NotImplementedException();

            public bool Identified { get; }

            public AuthenticationMechanism AuthenticationMechanism => throw new NotImplementedException();

            public bool IsInRole(string role) => throw new NotImplementedException();
        }
    }
}
