// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

namespace Model.Authorization
{
    public static class TokenType
    {
        public const string Key = @"token-type";
        public const string Id = @"id-token";
        public const string Access = @"access-token";
        public const string Api = @"api-token";
    }

    public static class Role
    {
        public const string Admin = @"admin";
        public const string Super = @"super";
        public const string Phi = @"phi";
        public const string Fed = @"fed";
    }

    public static class Session
    {
        public const string Key = @"session-type";
        public const string QI = @"qi";
        public const string Research = @"research";
    }

    public static class Data
    {
        public const string Key = @"data-class";
        public const string Identified = @"phi";
        public const string Deidentified = @"noid";
    }

    public static class Access
    {
        public const string Institutional = @"institutional";
    }

    public static class Group
    {
        public const string Key = @"leaf-group";
    }

    public static class AuthType
    {
        public const string Key = @"auth-type";
    }

    public static class Nonce
    {
        public const string Id = @"id-nonce";
        public const string Access = @"access-nonce";
    }

    public static class LeafVersion
    {
        public const string Key = @"leaf-version";
    }
}
