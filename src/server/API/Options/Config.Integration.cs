// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace API.Options
{
    public static partial class Config
    {
        public static class Integration
        {
            public const string Enabled = @"Integration:Enabled";

            public static class SHRINE
            {
                public const string Section = @"Integration:SHRINE";
                public const string Enabled = @"Integration:SHRINE:Enabled";
                public const string HubApiURI = @"Integration:SHRINE:HubApiURI";
                public const string NodeId = @"Integration:SHRINE:LocalNodeId";
                public const string NodeName = @"Integration:SHRINE:LocalNodeName";
            }
        }
    }
}
