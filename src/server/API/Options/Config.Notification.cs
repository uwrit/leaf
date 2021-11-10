// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
            public const string Enabled = @"Notification:Enabled";

            public static class Email
            {
                public const string Server = @"Notification:Email:Server";
                public const string Port = @"Notification:Email:Port";
                public const string UseSSL = @"Notification:Email:UseSSL";

                public static class Sender
                {
                    public const string Address = @"Notification:Email:Sender:Address";
                }

                public static class Receiver
                {
                    public const string Address = @"Notification:Email:Receiver:Address";
                }

                public static class Credentials
                {
                    public const string Username = @"Notification:Email:Credentials:Username";
                    public const string Password = @"Notification:Email:Credentials:Password";
                }
            }
        }
    }
}
