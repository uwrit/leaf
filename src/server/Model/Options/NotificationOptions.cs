// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Options
{
    public class NotificationOptions
    {
        public SmtpOptions Smtp { get; set; }

        public class SmtpOptions
        {
            public string Server { get; set; }
            public int? Port { get; set; }
            public bool EnableSSL { get; set; }
            public CredentailOptions Credentials { get; set; }
            public MailAddress Sender { get; set; }
            public MailAddress Receiver { get; set; }

            public class CredentailOptions
            {
                public string Username { get; set; }
                public string Password { get; set; }

                bool @checked;
                bool useDefault;
                public bool UseDefault
                {
                    get
                    {
                        if (!@checked)
                        {
                            useDefault = string.IsNullOrEmpty(Username) || string.IsNullOrEmpty(Password);
                            @checked = true;
                        }
                        return useDefault;
                    }
                }
            }

            public class MailAddress
            {
                public string Name { get; set; }
                public string Address { get; set; }
            }
        }
    }
}
