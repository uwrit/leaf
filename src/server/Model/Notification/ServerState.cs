// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Notification
{
    public class ServerState
    {
        public bool IsUp { get; set; }
        public string DowntimeMessage { get; set; }
        public DateTime DowntimeFrom { get; set; }
        public DateTime DowntimeUntil { get; set; }
        public IEnumerable<UserNotification> Notifications;
        public Database Db = new Database();
    }

    public class UserNotification
    {
        public Guid Id { get; set; }
        public string Message { get; set; }
    }

    public class Database
    {
        public Version Version { get; set; }
    }
}