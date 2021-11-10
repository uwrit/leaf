// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Admin.Notification
{
    public class AdminAppState
    {
        public bool IsUp { get; set; }
        public string DowntimeMessage { get; set; }
        public DateTime DowntimeUntil { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }
        public IEnumerable<AdminUserNotification> Notifications;
    }

    public class AdminUserNotification
    {
        public Guid Id { get; set; }
        public string Message { get; set; }
        public DateTime Until { get; set; }
        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }
    }
}