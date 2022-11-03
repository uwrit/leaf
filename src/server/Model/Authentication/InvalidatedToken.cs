﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Extensions;

namespace Model.Authentication
{
    public class InvalidatedToken
    {
        public Guid IdNonce { get; set; }
        public DateTime Expires { get; set; }

        public static InvalidatedToken FromUTCTicks(string nonce, long ticks)
        {
            var date = DateTimes.FromUTCTicks(ticks);
            return new InvalidatedToken { IdNonce = new Guid(nonce), Expires = date };
        }
    }
}
