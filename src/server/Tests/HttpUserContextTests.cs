// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Options;
using System.Security.Claims;
using System.Security.Principal;
using Model.Authorization;
using API.Authorization;
using System.IdentityModel.Tokens.Jwt;

namespace Tests
{
    public class HttpUserContextTests
    {

        class MockAccessor : IHttpContextAccessor
        {
            public HttpContext HttpContext { get; set; }

            public static IHttpContextAccessor With(string username, params Claim[] claims)
            {
                var user = new ClaimsIdentity(new MockIdentity(username), claims);

                var context = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(user)
                };

                return new MockAccessor { HttpContext = context };
            }
        }

        class MockIdentity : IIdentity
        {
            public string AuthenticationType => "Testing";

            public bool IsAuthenticated => true;

            public string Name { get; }

            public MockIdentity(string name)
            {
                Name = name;
            }
        }

        public IOptions<JwtVerifyingOptions> GetJwtVerifyingOptions(string issuer = null)
        {
            return Options.Create(new JwtVerifyingOptions
            {
                Issuer = issuer
            });
        }

        [Fact]
        public void Groups_Contains_All_Group_Claims()
        {
            var acc = MockAccessor.With("user@localhost",
                new Claim(Group.Key, "test-group-1"),
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Contains(ctx.Groups, g => g.Equals("test-group-1@localhost@urn:leaf:iss:test.tld"));
        }

        [Fact]
        public void Roles_Contains_All_Role_Claims()
        {
            var acc = MockAccessor.With("user",
                new Claim(ClaimTypes.Role, Role.Admin));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Contains(ctx.Roles, r => r.Equals(Role.Admin));
        }

        [Fact]
        public void IsInRole_Is_True_When_User_Is_In_Role()
        {
            var acc = MockAccessor.With("tester",
                new Claim(ClaimTypes.Role, Role.Admin));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.True(ctx.IsInRole(Role.Admin));
        }

        [Fact]
        public void IsInRole_Is_False_When_User_Is_Not_In_Role()
        {
            var acc = MockAccessor.With("tester",
                new Claim(ClaimTypes.Role, Role.Admin));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.False(ctx.IsInRole(Role.Fed));
        }

        [Fact]
        public void IsAdmin_Is_True_When_User_Is_In_Admin_Role()
        {
            var acc = MockAccessor.With("tester",
                new Claim(ClaimTypes.Role, Role.Admin),
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions("urn:leaf:iss:test.tld"));

            Assert.True(ctx.IsAdmin);
        }

        [Fact]
        public void IsAdmin_Is_False_When_User_Is_Not_In_Admin_Role()
        {
            var acc = MockAccessor.With("tester",
                new Claim(ClaimTypes.Role, Role.Fed),
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions("urn:leaf:iss:test.tld"));

            Assert.False(ctx.IsAdmin);
        }

        [Fact]
        public void IsQuarantined_Is_False_When_User_Is_In_Fed_Role()
        {
            var acc = MockAccessor.With("tester",
                new Claim(ClaimTypes.Role, Role.Fed));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.False(ctx.IsQuarantined);
        }

        [Fact]
        public void IsQuarantined_Is_True_When_User_Is_Not_In_Fed_Role()
        {
            var acc = MockAccessor.With("tester",
                new Claim(ClaimTypes.Role, Role.Admin));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.True(ctx.IsQuarantined);
        }

        [Fact]
        public void Issuer_Does_Not_Return_Null()
        {
            var acc = MockAccessor.With("tester",
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal("urn:leaf:iss:test.tld", ctx.Issuer);
        }

        [Fact]
        public void UUID_Does_Not_Return_Null()
        {
            var acc = MockAccessor.With("tester",
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal("tester@urn:leaf:iss:test.tld", ctx.UUID);
        }

        [Fact]
        public void IsInstitutional_Is_True_When_Issues_Match()
        {
            var acc = MockAccessor.With("tester",
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions("urn:leaf:iss:test.tld"));

            Assert.True(ctx.IsInstitutional);
        }

        [Fact]
        public void IsInstitutional_Is_False_When_Issues_Do_Not_Match()
        {
            var acc = MockAccessor.With("tester",
                new Claim(JwtRegisteredClaimNames.Iss, "urn:leaf:iss:test.tld"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions("urn:leaf:iss:failTest.tld"));

            Assert.False(ctx.IsInstitutional);
        }

        [Fact]
        public void IdNonce_Returns_A_Guid()
        {
            var id = Guid.NewGuid();
            var acc = MockAccessor.With("tester",
                new Claim(Nonce.Id, id.ToString()));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal(id, ctx.IdNonce);
        }

        [Fact]
        public void SessionNonce_Returns_A_Guid_If_Session_Exists()
        {
            var sess = Guid.NewGuid();
            var acc = MockAccessor.With("tester",
                new Claim(Nonce.Access, sess.ToString()));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal(sess, ctx.SessionNonce);
        }

        [Fact]
        public void SessionNonce_Returns_Default_If_Session_Does_Not_Exist()
        {
            var acc = MockAccessor.With("tester");
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal(default, ctx.SessionNonce);
        }

        [Fact]
        public void Identified_Returns_True_When_Data_Key_Matches_Data_Identified()
        {
            var acc = MockAccessor.With("tester",
                new Claim(Data.Key, Data.Identified));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.True(ctx.Identified);
        }

        [Fact]
        public void Identified_Returns_False_When_Data_Key_Is_WhiteSpace()
        {
            var acc = MockAccessor.With("tester");
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.False(ctx.Identified);
        }

        [Fact]
        public void AuthenticationMechanism_Is_Unsecured()
        {
            var acc = MockAccessor.With("tester",
                new Claim(AuthType.Key, "Unsecured"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal(AuthenticationMechanism.Unsecured, ctx.AuthenticationMechanism);
        }

        [Fact]
        public void AuthenticationMechanism_Is_Saml2()
        {
            var acc = MockAccessor.With("tester",
                new Claim(AuthType.Key, "Saml2"));
            var ctx = new HttpUserContext(acc, GetJwtVerifyingOptions());

            Assert.Equal(AuthenticationMechanism.Saml2, ctx.AuthenticationMechanism);
        }
    }
}
