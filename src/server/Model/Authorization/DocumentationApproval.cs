// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Authorization
{
    public class DocumentationApproval
    {
        /// <summary>
        /// Date the IRB or QI Approval is set to expire
        /// </summary>
        public DateTime ExpirationDate { get; set; }

        /// <summary>
        /// The institution or body that approved the project
        /// </summary>
        public string Institution { get; set; }

        /// <summary>
        /// The title of the project
        /// </summary>
        public string Title { get; set; }
    }
}
