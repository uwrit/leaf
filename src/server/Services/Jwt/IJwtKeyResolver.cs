// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;

namespace Services.Jwt
{
    public interface IJwtKeyResolver
    {
        IEnumerable<SecurityKey> ResolveKey(string token, SecurityToken securityToken, string kid, TokenValidationParameters validationParameters);
    }
}