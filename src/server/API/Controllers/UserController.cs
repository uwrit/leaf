// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Model.Options;
using Model.Authentication;
using Model.Authorization;
using API.Jwt;
using API.DTO.User;
using System.IdentityModel.Tokens.Jwt;

namespace API.Controllers
{
    [Produces("application/json")]
    [Route("api/user")]
    public class UserController : Controller
    {
        readonly ILogger<UserController> logger;
        readonly AuthenticationOptions authenticationOptions;
        readonly IUserJwtProvider jwtProvider;

        public UserController(
            ILogger<UserController> logger,
            IOptions<AuthenticationOptions> authenticationOptions,
            IUserJwtProvider userJwtProvider)
        {
            this.logger = logger;
            this.authenticationOptions = authenticationOptions.Value;
            jwtProvider = userJwtProvider;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IdTokenDTO>> GetUser()
        {
            try
            {
                var login = await jwtProvider.IdToken(HttpContext);

                return Ok(new IdTokenDTO { IdToken = login });
            }
            catch (LeafAuthenticationException lae)
            {
                logger.LogError("User is not authorized to use Leaf. Error:{Error} User:{user}", lae.Message, HttpContext.User);
                return StatusCode(StatusCodes.Status403Forbidden);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to produce identity token. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = TokenType.Id)]
        [Authorize(Policy = Access.Institutional)]
        [HttpGet("attest")]
        public ActionResult<AccessTokenDTO> Attest(
            [FromQuery] Attestation attestation,
            [FromServices] IUserContextProvider userContextProvider,
            [FromServices] IInvalidatedTokenCache invalidatedCache)
        {
            var user = userContextProvider.GetUserContext();
            if (authenticationOptions.Mechanism != user.AuthenticationMechanism)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

            try
            {
                if (invalidatedCache.IsInvalidated(user.IdNonce))
                {
                    logger.LogWarning("Id token is invalidated. IdNonce:{IdNonce} Attestation:{@Attestation}", user.IdNonce, attestation);
                    return StatusCode(StatusCodes.Status401Unauthorized);
                }

                var token = jwtProvider.AccessToken(HttpContext, attestation);

                logger.LogInformation("Created Access Token. Attestation:{@Attestation} Token:{Token}", attestation, token);

                return Ok(new AccessTokenDTO { AccessToken = token });
            }
            catch (Exception e)
            {
                logger.LogError("Failed to produce access token. Attestation:{@Attestation} Error:{Error}", attestation, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = TokenType.Access)]
        [Authorize(Policy = Access.Institutional)]
        [HttpGet("refresh")]
        public ActionResult<AccessTokenDTO> Refresh(
            [FromServices] IInvalidatedTokenCache invalidatedCache,
            [FromServices] IUserContextProvider userContextProvider)
        {
            var user = userContextProvider.GetUserContext();
            if (authenticationOptions.Mechanism != user.AuthenticationMechanism)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

            try
            {
                if (invalidatedCache.IsInvalidated(user.IdNonce))
                {
                    logger.LogWarning("Id token is invalidated. IdNonce:{IdNonce} Attestation:{@Attestation}", user.IdNonce);
                    return StatusCode(StatusCodes.Status401Unauthorized);
                }

                var token = jwtProvider.AccessToken(HttpContext);

                logger.LogInformation("Refreshed Access Token. Token:{Token}", token);

                return Ok(new AccessTokenDTO { AccessToken = token });
            }
            catch (Exception e)
            {
                logger.LogError("Failed to refresh access token. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = TokenType.Id)]
        [Authorize(Policy = Access.Institutional)]
        [HttpPost("logout")]
        public async Task<ActionResult<LogoutDTO>> LogoutAsync([FromServices] IInvalidatedTokenService invalidatedService)
        {
            if (authenticationOptions.IsUnsecured || !authenticationOptions.Logout.Enabled)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }

            var nonce = User.FindFirst(Nonce.Id).Value;
            var ticks = Convert.ToInt64(User.FindFirst(JwtRegisteredClaimNames.Exp).Value);
            var token = InvalidatedToken.FromUTCTicks(nonce, ticks);
            try
            {
                logger.LogInformation("Invalidating Token: {@Token}", token);
                await invalidatedService.Invalidate(token);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to logout user. Error:{Error}", e.ToString());
            }

            return Ok(new LogoutDTO { LogoutURI = authenticationOptions.Logout.URI?.AbsoluteUri });
        }
    }
}
