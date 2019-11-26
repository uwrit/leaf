// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Model.Notification
{
    public class NotificationManager
    {
        public interface INotificationService
        {
            Task<bool> NotifyAsync(IEnumerable<string> recievers, string message);
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
            try
            {
                log.LogInformation("S. UserId:{@userId}", userId);
                var queries = await svc.GetUserQueriesAsync(userId);
                return queries;
            }
        }
    }
}
