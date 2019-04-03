// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.DirectoryServices.AccountManagement;
using System.DirectoryServices;
using Model.Authentication;
using Model.Authorization;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Tests.Mock.Services.Authorization
{
    public class MockMembershipProvider : IMembershipProvider
    {
        readonly IEnumerable<string> members;
        readonly IEnumerable<string> membership;

        public MockMembershipProvider(IEnumerable<string> ms, IEnumerable<string> mship)
        {
            members = ms;
            membership = mship;
        }

        public IEnumerable<string> GetMembers(string group)
        {
            return members;
        }

        public IEnumerable<string> GetMembership(string username)
        {
            return membership;
        }
    }
}
