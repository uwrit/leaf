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

                public static class Node
                {
                    public const string Id = @"Integration:SHRINE:Node:Id";
                    public const string Name = @"Integration:SHRINE:Node:Name";
                }

                public static class Topic
                {
                    public const string Id = @"Integration:SHRINE:Topic:Id";
                    public const string Name = @"Integration:SHRINE:Topic:Name";
                    public const string Description = @"Integration:SHRINE:Topic:Description";
                }
            }
        }
    }
}
