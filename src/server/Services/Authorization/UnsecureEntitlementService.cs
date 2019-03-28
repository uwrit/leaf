// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Model.Authorization;
using Model.Authentication;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Services.Authorization
{
    public class UnsecureEntitlementService : IFederatedEntitlementService
    {
        public Entitlement GetEntitlement(HttpContext context)
        {
            return new Entitlement
            {
                Mask = RoleMask.User | RoleMask.Admin | RoleMask.Super | RoleMask.CanIdentify,
                Groups = new string[] { }
            };
        }
    }
}
