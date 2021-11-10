// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Options
{
    public static partial class Config
    {
        public static class Jwt
        {
            public const string Section = @"Jwt";
            public const string SigningKey = @"Jwt:SigningKey";
            public const string Password = @"Jwt:Password";
            public const string Certificate = @"Jwt:Certificate";
            public const string Issuer = @"Jwt:Issuer";
        }
    }
}
