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
        ShrineQueryResult PopOrDefault(long id);
        void Put(ShrineQueryResult result);
        void Put(ShrineResultProgress nodeResult);
        void Put(long id, ShrineResearcher user);
        void Put(IEnumerable<ShrineResultProgress> nodeResults);
        int DeleteOlderThan(DateTime earliest);
    }

    public class ShrineQueryResultCache : IShrineQueryResultCache
    {
        readonly Dictionary<long, ShrineQueryResult> store = new();
        readonly ReaderWriterLockSlim sync = new();

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
            store[result.Id].Updated = DateTime.Now;
            sync.ExitWriteLock();
        }

        public void Put(long id, ShrineResearcher user)
        {
            sync.EnterWriteLock();
            if (!store.ContainsKey(id))
            {
                store[id] = new ShrineQueryResult(id);
            }
            store[id].User = user;
            sync.ExitWriteLock();
        }

        public void Put(ShrineResultProgress nodeResult)
        {
            sync.EnterWriteLock();
            if (!store.ContainsKey(nodeResult.QueryId))
            {
                store[nodeResult.QueryId] = new ShrineQueryResult(nodeResult.QueryId);
            }
            store[nodeResult.QueryId].Results[nodeResult.AdapterNodeId] = nodeResult;
            store[nodeResult.QueryId].Updated = DateTime.Now;
            sync.ExitWriteLock();
        }

        public void Put(IEnumerable<ShrineResultProgress> nodeResults)
        {
            if (!nodeResults.Any()) return;

            sync.EnterWriteLock();
            var first = nodeResults.First();
            if (!store.ContainsKey(first.QueryId))
            {
                store[first.QueryId] = new ShrineQueryResult(first.QueryId);
            }
            foreach (var nodeResult in nodeResults)
            {
                store[first.QueryId].Results[nodeResult.AdapterNodeId] = nodeResult;
            }
            store[first.QueryId].Updated = DateTime.Now;
            sync.ExitWriteLock();
        }

        public ShrineQueryResult PopOrDefault(long id)
        {
            sync.EnterWriteLock();
            store.Remove(id, out var result);
            sync.ExitWriteLock();
            return result;
        }

        public int DeleteOlderThan(DateTime earliest)
        {
            var deleteCount = 0;

            sync.EnterWriteLock();
            foreach (var result in All())
            {
                if (result.Updated < earliest)
                {
                    store.Remove(result.Id, out var _);
                    deleteCount++;
                }
            }
            sync.ExitWriteLock();

            return deleteCount;
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

