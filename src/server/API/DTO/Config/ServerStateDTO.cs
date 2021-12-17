// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Notification;

namespace API.DTO.Config
{
    public class ServerStateDTO
    {
        public bool IsUp { get; set; }
        public string DowntimeMessage { get; set; }
        public DateTime DowntimeFrom { get; set; }
        public DateTime DowntimeUntil { get; set; }
        public IEnumerable<UserNotificationDTO> Notifications = new List<UserNotificationDTO>();

        public ServerStateDTO(ServerState state)
        {
            IsUp = state.IsUp;
            DowntimeMessage = state.DowntimeMessage;
            DowntimeFrom = state.DowntimeFrom;
            DowntimeUntil = state.DowntimeUntil;

            if (state.Notifications.Any())
            {
                Notifications = state.Notifications.Select(n => new UserNotificationDTO(n));
            }
        }
    }

    public class UserNotificationDTO
    {
        public Guid Id { get; set; }
        public string Message { get; set; }

        public UserNotificationDTO(UserNotification notification)
        {
            Id = notification.Id;
            Message = notification.Message;
        }
    }
}
