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
        public bool Enabled { get; set; }
        public SmtpOptions Smtp { get; set; }

        public NotificationOptions()
        {
            Smtp = new SmtpOptions();
        }
    }

    public class SmtpOptions
    {
        public string Server { get; set; }
        public int? Port { get; set; }
        public CredentailOptions Credentials { get; set; }
        public MailAddress Sender { get; set; }
        public MailAddress Receiver { get; set; }

        public SmtpOptions()
        {
            Credentials = new CredentailOptions();
            Sender = new MailAddress();
            Receiver = new MailAddress();
        }

        public class CredentailOptions
        {
            public bool EnableSSL { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }

            bool credChecked;
            bool useDefault;
            public bool UseDefault
            {
                get
                {
                    if (!credChecked)
                    {
                        useDefault = string.IsNullOrEmpty(Username) || string.IsNullOrEmpty(Password);
                        credChecked = true;
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
