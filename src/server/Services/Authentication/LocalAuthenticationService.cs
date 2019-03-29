// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Dapper;
using Model.Authentication;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Services.Authentication
{
    // TODO(cspital) Add logging
    public class LocalAuthenticationService : ILoginService
    {
        readonly AppDbOptions opts;
        public LocalAuthenticationService(IOptions<AppDbOptions> options)
        {
            opts = options.Value;
        }

        public async Task<bool> AuthenticateAsync(LoginCredentials credentials)
        {
            if (credentials == null)
            {
                return false;
            }

            var login = await GetLoginByUsernameAsync(credentials.Username);
            if (login == null)
            {
                return false;
            }

            return Authenticate(credentials.Password, login);
        }

        public async Task<Login> RegisterAsync(LoginCredentials credentials)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var login = NewLogin(credentials);

                var id = await cn.ExecuteScalarAsync<int>(
                    "auth.sp_CreateLogin",
                    new
                    {
                        username = login.Username,
                        salt = login.Salt,
                        hash = login.Hash
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                login.Id = id;

                return login;
            }
        }

        async Task<Login> GetLoginByUsernameAsync(string username)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var login = await cn.QueryFirstOrDefaultAsync<Login>(
                    "auth.sp_GetLoginByUsername",
                    new { username },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return login;
            }
        }

        Login NewLogin(LoginCredentials credentials)
        {
            var salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var hash = Hash(salt, credentials.Password);

            return new Login
            {
                Username = credentials.Username,
                Salt = salt,
                Hash = hash
            };
        }

        bool Authenticate(string password, Login login)
        {
            var userhash = Hash(login.Salt, password);

            return userhash.SequenceEqual(login.Hash);
        }

        byte[] Hash(byte[] salt, string password)
        {
            return KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA512,
                iterationCount: 20000,
                numBytesRequested: 512 / 8
            );
        }
    }
}
