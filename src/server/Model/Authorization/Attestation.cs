// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Authorization
{
    /// <summary>
    /// Represents a user's attestation selections.
    /// Proposed usage of leaf for the session.
    /// </summary>
    public class Attestation
    {
        public string Nonce { get; set; }

        public SessionType SessionType { get; set; }

        public DocumentationApproval Documentation { get; set; }

        public bool IsIdentified { get; set; }
    }
}
