// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Authentication
{
    public class SAML2ScopedIdentity : IScopedIdentity
    {
        public string Identity { get; set; }
        public string Scope { get; set; }
        public string ScopedIdentity => $"{Identity}@{Scope}";

        public SAML2ScopedIdentity() { }
        public SAML2ScopedIdentity(string scopedId)
        {
            if (string.IsNullOrWhiteSpace(scopedId))
            {
                throw new FormatException($"SAML scoped identity value is missing.");
            }
            var parts = scopedId.Split('@');
            if (parts.Length != 2)
            {
                throw new FormatException($"SAML scoped identity value {scopedId} is malformed, expecting identity@scope");
            }
            Identity = parts[0];
            Scope = parts[1];
        }
    }
}
