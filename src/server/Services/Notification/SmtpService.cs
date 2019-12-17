// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Mail;
using Model.Notification;
using Model.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;

namespace Services.Notification
{
    public class SmtpService : NotificationManager.INotificationService
    {
        readonly ILogger<SmtpService> logger;
        readonly NotificationOptions options;
        readonly SmtpClient client;

        public SmtpService(ILogger<SmtpService> logger, IOptions<NotificationOptions> options)
        {
            this.logger = logger;
            this.options = options.Value;

            var smtp = this.options.Smtp;
            client = new SmtpClient(smtp.Server)
            {
                UseDefaultCredentials = smtp.Credentials.UseDefault,
                EnableSsl = smtp.EnableSSL
            };

            if (!client.UseDefaultCredentials)
            {
                client.Credentials = new NetworkCredential(smtp.Credentials.Username, smtp.Credentials.Password);
            }
            if (smtp.Port.HasValue)
            {
                client.Port = (int)smtp.Port;
            }
        }

        public async Task<bool> NotifyAsync(string subject, string content)
        {
            using (var message = new MailMessage
            {
                From = new MailAddress(options.Smtp.Sender.Address, options.Smtp.Sender.Name),
                Body = content,
                Subject = subject
            })
            {
                message.To.Add(new MailAddress(options.Smtp.Receiver.Address));
                await client.SendMailAsync(message);
                return true;
            }
        }
    }
}
