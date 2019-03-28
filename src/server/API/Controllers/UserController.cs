// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Model.Options;
using Model.Authentication;
using Model.Authorization;
using Model.Network;
using Services;
using Services.Authentication;
using Services.Authorization;
using Services.Jwt;
using DTO.User;
using System.IdentityModel.Tokens.Jwt;

namespace API.Controllers
{
    [Produces("application/json")]
    [Route("api/user")]
    public class UserController : Controller
    {
        readonly ILogger<UserController> logger;
        readonly AuthenticationOptions authenticationOptions;
        readonly LeafVersionOptions versionOptions;
        readonly CohortOptions cohortOptions;
        readonly ClientOptions clientOptions;
        readonly IUserJwtProvider jwtProvider;
        readonly IUserContext userContext;

        public UserController(
            ILogger<UserController> logger,
            IOptions<AuthenticationOptions> authenticationOptions,
            IOptions<LeafVersionOptions> versionOptions,
            IOptions<CohortOptions> cohortOptions,
            IOptions<ClientOptions> clientOptions,
            IUserJwtProvider userJwtProvider,
            IUserContext userContext)
        {
            this.logger = logger;
            this.authenticationOptions = authenticationOptions.Value;
            this.versionOptions = versionOptions.Value;
            this.cohortOptions = cohortOptions.Value;
            this.clientOptions = clientOptions.Value;
            this.userContext = userContext;
            jwtProvider = userJwtProvider;
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult<IdTokenDTO> GetUser()
        {
            if (authenticationOptions.IsActiveDirectory)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }

            try
            {
                var token = jwtProvider.IdToken(HttpContext);
                return Ok(new IdTokenDTO { IdToken = token });
            }
            catch (LeafAuthenticationException lae)
            {
                logger.LogError("User is not authorized to use Leaf. Error:{Error}", lae.Message);
                return StatusCode(StatusCodes.Status403Forbidden);
            }
            catch (Exception e)
            {
                logger.LogError("Could not produce identity token. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = TokenType.Id)]
        [Authorize(Policy = Access.Institutional)]
        [HttpGet("attest")]
        public ActionResult<AccessTokenDTO> Attest(
            [FromQuery] Attestation attestation,
            [FromServices] TokenBlacklistCache blacklistCache)
        {
            if (authenticationOptions.Mechanism != userContext.AuthenticationMechanism)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

            try
            {
                if (blacklistCache.IsBlacklisted(userContext.IdNonce))
                {
                    return StatusCode(StatusCodes.Status401Unauthorized);
                }

                var token = jwtProvider.AccessToken(HttpContext, attestation);
                return Ok(new AccessTokenDTO { AccessToken = token });
            }
            catch (Exception e)
            {
                logger.LogError("Could not produce access token.", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = TokenType.Access)]
        [Authorize(Policy = Access.Institutional)]
        [HttpGet("refresh")]
        public ActionResult<AccessTokenDTO> Refresh([FromServices] TokenBlacklistCache blacklistCache)
        {
            if (authenticationOptions.Mechanism != userContext.AuthenticationMechanism)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

            try
            {
                if (blacklistCache.IsBlacklisted(userContext.IdNonce))
                {
                    return StatusCode(StatusCodes.Status401Unauthorized);
                }

                var token = jwtProvider.AccessToken(HttpContext);
                return Ok(new AccessTokenDTO { AccessToken = token });
            }
            catch (Exception e)
            {
                logger.LogError("Could not refresh access token.", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        [AllowAnonymous]
        [HttpGet("login/config")]
        public ActionResult<LoginConfigDTO> LoginConfig()
        {
            var config = new LoginConfigDTO
            {
                Mechanism = authenticationOptions.Mechanism,
                InactivityTimeoutMinutes = authenticationOptions.InactiveTimeoutMinutes,
                CacheLimit = cohortOptions.RowLimit,
                ExportLimit = cohortOptions.ExportLimit,
                LogoutUri = authenticationOptions.LogoutURI.ToString(),
                Version = versionOptions.Version.ToString(),
                ClientOptions = clientOptions
            };
            return Ok(config);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<IdTokenDTO>> Login(
            [FromBody] LoginCredentials credentials,
            [FromServices] ILoginService loginService,
            [FromServices] ActiveDirectoryCache adCache
        )
        {
            if (!authenticationOptions.IsActiveDirectory)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }

            if (!adCache.CanLogin(credentials.Username))
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            try
            {
                var ok = await loginService.AuthenticateAsync(credentials);
                if (!ok)
                {
                    return StatusCode(StatusCodes.Status401Unauthorized);
                }
                var token = jwtProvider.IdToken(HttpContext);
                return Ok(new IdTokenDTO { IdToken = token });
            }
            catch (LeafAuthenticationException lae)
            {
                logger.LogError("User is not authorized to use Leaf. {Error}", lae.Message);
                return StatusCode(StatusCodes.Status403Forbidden);
            }
            catch (Exception e)
            {
                logger.LogError("Could not authenticate user. {Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = TokenType.Id)]
        [Authorize(Policy = Access.Institutional)]
        [HttpPost("logout")]
        public async Task<ActionResult<LogoutDTO>> LogoutAsync([FromServices] ITokenBlacklistService blacklistService)
        {
            if (authenticationOptions.IsUnsecured)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }

            var nonce = User.FindFirst(Nonce.Id).Value;
            var ticks = Convert.ToInt64(User.FindFirst(JwtRegisteredClaimNames.Exp).Value);
            var token = BlacklistedToken.FromUTCTicks(nonce, ticks);
            try
            {
                await blacklistService.Blacklist(token);
            }
            catch (Exception e)
            {
                logger.LogError("Could not logout user. {Error}", e.ToString());
            }

            return Ok(new LogoutDTO { LogoutURI = authenticationOptions.LogoutURI?.AbsoluteUri });
        }
    }
}
