﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Model.Notification
{
    public class NotificationManager
    {
        public interface INotificationService
        {
            Task<bool> NotifyAsync(string subject, string content);
        }

        readonly INotificationService svc;
        readonly ILogger<NotificationManager> log;

        public NotificationManager(
            INotificationService service,
            ILogger<NotificationManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<bool> SendUserInquiry(UserInquiry inquiry)
        {
            var typeText =
                inquiry.Type == UserInquiry.UserInquiryType.DataRequest ? "Data Request" :
                inquiry.Type == UserInquiry.UserInquiryType.HelpMakingQuery ? "Assistance in making query" : "Other";

            var subject = @"Leaf User Question Received";
            var body = $@"
                <html>
                    <head>
                        <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
                    </head>
                    <body style='font-family:arial,helvetica;font-size:10pt;'>
                        [This message was automatically generated by Leaf] </br>
                        </br>
                        This email is to notify you that user <b>{inquiry.EmailAddress}</b> has asked the following question: </br>
                        </br>
                        <span>Type: {typeText}</span></br>
                        <span><strong>{inquiry.Text}<strong></span>
                    </body>
                </html>";
            await svc.NotifyAsync(subject, body);
            return true;
        }
    }
}
