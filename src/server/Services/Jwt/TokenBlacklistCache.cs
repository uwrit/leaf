// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Authentication;
using System.Threading;
using System.Collections.Generic;

namespace Services.Jwt
{
    public class TokenBlacklistCache
    {
        readonly ReaderWriterLockSlim sync;
        HashSet<Guid> blacklist;

        public TokenBlacklistCache()
        {
            sync = new ReaderWriterLockSlim();
            blacklist = new HashSet<Guid>();
        }

        public TokenBlacklistCache(IEnumerable<BlacklistedToken> initial)
        {
            sync = new ReaderWriterLockSlim();
            blacklist = UniqNonces(initial);
        }

        public bool IsBlacklisted(Guid idNonce)
        {
            sync.EnterReadLock();
            try
            {
                return blacklist.Contains(idNonce);
            }
            finally
            {
                sync.ExitReadLock();
            }
        }

        public void Overwrite(IEnumerable<BlacklistedToken> tokens)
        {
            var set = UniqNonces(tokens);
            if (set == null)
            {
                set = new HashSet<Guid>();
            }

            sync.EnterWriteLock();
            try
            {

                blacklist = set;
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }

        public void Blacklist(BlacklistedToken token)
        {
            sync.EnterWriteLock();
            try
            {
                blacklist.Add(token.IdNonce);
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }

        static HashSet<Guid> UniqNonces(IEnumerable<BlacklistedToken> tokens)
        {
            return tokens?.Select(t => t.IdNonce)?.ToHashSet();
        }
    }
}
