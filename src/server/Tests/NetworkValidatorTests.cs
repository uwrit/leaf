// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using Tests.Mock.Models;
using Model.Options;
using Model.Network;
using Microsoft.Extensions.Options;

namespace Tests
{
    public class NetworkValidatorTests
    {
        [Fact]
        public void Create_IUriAddress_Without_Scheme_Throws_UriFormatException()
        {
            Assert.Throws<UriFormatException>(() => new Endpoint { Address = new Uri("leaf.uw.edu/leaf") });
        }

        [Fact]
        public void Ensure_Https_False_Allows_Http()
        {
            var opts = new NetworkValidationOptions { EnsureHttps = false };
            var val = new NetworkValidator(Options.Create(opts));
            var endpoint = new Endpoint { Address = new Uri("http://leaf.uw.edu/leaf") };

            val.Validate(endpoint);
        }

        [Fact]
        public void Ensure_Https_True_Disallows_Http()
        {
            var opts = new NetworkValidationOptions { EnsureHttps = true };
            var val = new NetworkValidator(Options.Create(opts));
            var endpoint = new Endpoint { Address = new Uri("http://leaf.uw.edu/leaf") };

            Assert.Throws<UriFormatException>(() => val.Validate(endpoint));
        }
    }
}
