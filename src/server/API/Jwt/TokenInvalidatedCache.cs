// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Authentication;
using System.Threading;
using System.Collections.Generic;

namespace API.Jwt
{
    public class TokenInvalidatedCache : IInvalidatedTokenCache
    {
        readonly ReaderWriterLockSlim sync;
        HashSet<Guid> invalidated;

        public TokenInvalidatedCache()
        {
            sync = new ReaderWriterLockSlim();
            invalidated = new HashSet<Guid>();
        }

        public TokenInvalidatedCache(IEnumerable<InvalidatedToken> initial)
        {
            sync = new ReaderWriterLockSlim();
            invalidated = UniqNonces(initial);
        }

        public bool IsInvalidated(Guid idNonce)
        {
            sync.EnterReadLock();
            try
            {
                return invalidated.Contains(idNonce);
            }
            finally
            {
                sync.ExitReadLock();
            }
        }

        public void Overwrite(IEnumerable<InvalidatedToken> tokens)
        {
            var set = UniqNonces(tokens);
            if (set == null)
            {
                set = new HashSet<Guid>();
            }

            sync.EnterWriteLock();
            try
            {

                invalidated = set;
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }

        public void Invalidate(InvalidatedToken token)
        {
            sync.EnterWriteLock();
            try
            {
                invalidated.Add(token.IdNonce);
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }

        static HashSet<Guid> UniqNonces(IEnumerable<InvalidatedToken> tokens)
        {
            return tokens?.Select(t => t.IdNonce)?.ToHashSet();
        }
    }
}
