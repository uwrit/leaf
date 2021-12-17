// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Security.Claims;
using System.Threading.Tasks;
using Model.Authorization;
using Microsoft.AspNetCore.Http;

namespace API.Jwt
{
    public interface IUserJwtProvider
    {
        Task<string> IdToken(HttpContext context);
        string AccessToken(HttpContext context);
        string AccessToken(HttpContext context, Attestation attestation);
    }
}