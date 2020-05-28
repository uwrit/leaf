// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Notification;
using Model.Tagging;

namespace API.DTO.Notification
{
    public class UserInquiryDTO
    {
        public string AssociatedQueryId { get; set; }
        public string EmailAddress { get; set; }
        public UserInquiry.UserInquiryType Type { get; set; }
        public string Text { get; set; }

        public UserInquiry ToInquiry()
        {
            return new UserInquiry
            {
                AssociatedQueryId = QueryUrn.From(AssociatedQueryId),
                EmailAddress = EmailAddress,
                Type = Type,
                Text = Text
            };
        }
    }
}
