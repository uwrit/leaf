﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using System.Text.RegularExpressions;

namespace Model.Notification
{
    public class NotificationManager
    {
        readonly Regex HTML_TAGS = new Regex("<(?:[^><\"\']*?(?:([\"\']).*?\\1)?[^><\'\"]*?)+(?:>|$)");

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

        public NotificationManager(INotificationService service, ILogger<NotificationManager> log, IUserContextProvider userContextProvider)
        {
            svc = service;
            this.log = log;
            this.user = userContextProvider.GetUserContext();
        }

        public async Task<bool> SendUserInquiry(UserInquiry inquiry)
        {
            log.LogInformation("Sending user inquiry. Inquiry:{@Inquiry}", inquiry);

            // Strip any possible HTML from malicious users and
            // replace newlines with HTML line breaks
            var text = HTML_TAGS.Replace(inquiry.Text, "").Replace("\n", "</br>");

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
                        <span><b>Request Type</b>: {typeText}</span></br>
                        </br>
                        <span>""{text}""</span>
                    </body>
                </html>";

            await svc.NotifyAsync(subject, body, ContentType.Html);
            return true;
        }
    }
}
