// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace API.Options
{
    public static partial class Config
    {
        public static class Notification
        {
            public static class Smtp
            {
                public const string Section = @"Notification:Email";
                public const string Server = @"Notification:Email:Server";
                public const string Port = @"Notification:Email:Port";
                public const string EnableSSL = @"Notification:Email:EnableSSL";

                public static class Sender
                {
                    public const string Name = @"Notification:Email:Sender:Name";
                    public const string Address = @"Notification:Email:Sender:Address";
                }

                public static class Credential
                {
                    public const string Username = @"Notification:Email:Username";
                    public const string Password = @"Notification:Email:Password";
                }
            }
        }
    }
}
