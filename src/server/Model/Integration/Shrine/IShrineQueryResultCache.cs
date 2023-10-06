// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Collections;

namespace Model.Integration.Shrine
{
    public interface IShrineQueryResultCache : IEnumerable<ShrineQueryResult>
    {
        IEnumerable<ShrineQueryResult> All();
        ShrineQueryResult GetOrDefault(long id);
        void Overwrite(IEnumerable<ShrineQueryResult> results);
        ShrineQueryResult PopOrDefault(long id);
        void Put(ShrineQueryResult result);
        void Put(IEnumerable<ShrineQueryResult> results);
    }

    public class ShrineQueryResultCache : IShrineQueryResultCache
    {
        Dictionary<long, ShrineQueryResult> store;
        readonly ReaderWriterLockSlim sync;

        public ShrineQueryResultCache(IEnumerable<ShrineQueryResult> initial)
        {
            
            store = initial.ToDictionary(ne => ne.Id);
            sync = new ReaderWriterLockSlim();
        }

        public IEnumerable<ShrineQueryResult> All()
        {
            sync.EnterReadLock();
            var all = store.Values;
            sync.ExitReadLock();
            return all;
        }

        public ShrineQueryResult GetOrDefault(long id)
        {
            sync.EnterReadLock();
            store.TryGetValue(id, out var result);
            sync.ExitReadLock();
            return result;
        }

        public void Put(ShrineQueryResult result)
        {
            sync.EnterWriteLock();
            store[result.Id] = result;
            sync.ExitWriteLock();
        }

        public void Put(IEnumerable<ShrineQueryResult> results)
        {
            sync.EnterWriteLock();
            foreach (var result in results)
            {
                store[result.Id] = result;
            }
            sync.ExitWriteLock();
        }

        public void Overwrite(IEnumerable<ShrineQueryResult> results)
        {
            sync.EnterWriteLock();
            store = results.ToDictionary(ne => ne.Id);
            sync.ExitWriteLock();
        }

        public ShrineQueryResult PopOrDefault(long id)
        {
            sync.EnterWriteLock();
            store.Remove(id, out var result);
            sync.ExitWriteLock();
            return result;
        }

        public IEnumerator<ShrineQueryResult> GetEnumerator()
        {
            return All().GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}

