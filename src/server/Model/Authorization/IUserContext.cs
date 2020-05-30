// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;

namespace Model.Authorization
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
        string Identity { get; }
        string UUID { get; }
        bool IsInstitutional { get; }
        bool IsAdmin { get; }
        bool IsQuarantined { get; }
        Guid IdNonce { get; }
        Guid? SessionNonce { get; }
        bool Identified { get; }
        SessionType SessionType { get; }
        AuthenticationMechanism AuthenticationMechanism { get; }

        bool IsInRole(string role);
    }
}
