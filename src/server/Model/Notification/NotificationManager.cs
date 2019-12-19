﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Authorization;

namespace Model.Notification
{
    public class NotificationManager
    {
        public interface INotificationService
        {
            Task<bool> NotifyAsync(string subject, string content, ContentType contentType);
        }

        public enum ContentType
        {
            Html = 1,
            PlainText = 2
        }

        readonly INotificationService svc;
        readonly IUserContext user;
        readonly ILogger<NotificationManager> log;

        public NotificationManager(INotificationService service, ILogger<NotificationManager> log, IUserContext user)
        {
            svc = service;
            this.log = log;
            this.user = user;
        }

        public async Task<bool> SendUserInquiry(UserInquiry inquiry)
        {
            log.LogInformation("Sending user inquiry. Inquiry:{@Inquiry}", inquiry);

            var typeText =
                inquiry.Type == UserInquiry.UserInquiryType.DataRequest ? "Data Request" :
                inquiry.Type == UserInquiry.UserInquiryType.HelpMakingQuery ? "Help in making query" : "Other";
            var subject = @"Leaf User Question Received";
            var body = $@"
                <html>
                    <head>
                        <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
                    </head>
                    <body style='font-family:arial,helvetica;font-size:10pt;'>
                        [This message was automatically generated by Leaf] </br>
                        </br>
                        This email is to notify you that user <b>{user.Identity}</b> ({inquiry.EmailAddress}) has asked the following question: </br>
                        </br>
                        <span><strong>Request Type</strong>: {typeText}</span></br>
                        <span><strong>Question</strong>: {inquiry.Text}</span>
                    </body>
                </html>";

            await svc.NotifyAsync(subject, body, ContentType.Html);
            return true;
        }
    }
}
