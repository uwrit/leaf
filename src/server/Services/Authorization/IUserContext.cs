// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Security.Claims;
using Model.Options;

namespace Services.Authorization
{
    /// <summary>
    /// User provider.
    /// Provides an accessor for the ClaimsPrincipal in the request.
    /// </summary>
    public interface IUserContext
    {
        string[] Groups { get; }
        string[] Roles { get; }
        string Issuer { get; }
        string UUID { get; }
        bool IsInstutional { get; }
        bool IsAdmin { get; }
        Guid IdNonce { get; }
        Guid? SessionNonce { get; }
        bool Identified { get; }
        AuthenticationMechanism AuthenticationMechanism { get; }
    }
}
