// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;

namespace Model.Notification
{
    public class UserInquiry
    {
        public QueryUrn AssociatedQueryId { get; set; }
        public string EmailAddress { get; set; }
        public UserInquiryType Type { get; set; }
        public string Text { get; set; }

        public enum UserInquiryType
        {
            HelpMakingQuery = 1,
            DataRequest = 2,
            Other = 3
        }
    }
}
