// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading;
using Model.Authorization;
using Model.Compiler;

namespace Model.Integration.Shrine
{
	public interface IShrineUserQueryCache : IEnumerable<ShrineUserQueryEntry>
    {
        IEnumerable<ShrineUserQueryEntry> All();
        ShrineUserQueryEntry GetOrDefault(long id);
        ShrineUserQueryEntry PopOrDefault(long id);
        void Put(long id, IUserContext user, IPatientCountQueryDTO query);
        int DeleteOlderThan(DateTime earliest);
    }

	public class ShrineUserContextCache : IShrineUserQueryCache
    {
        readonly Dictionary<long, ShrineUserQueryEntry> store = new();
        readonly ReaderWriterLockSlim sync = new();

        public IEnumerable<ShrineUserQueryEntry> All()
        {
            sync.EnterReadLock();
            var all = store.Values;
            sync.ExitReadLock();
            return all;
        }

        public ShrineUserQueryEntry GetOrDefault(long id)
        {
            sync.EnterReadLock();
            store.TryGetValue(id, out var result);
            sync.ExitReadLock();
            return result;
        }

        public ShrineUserQueryEntry PopOrDefault(long id)
        {
            sync.EnterWriteLock();
            store.Remove(id, out var result);
            sync.ExitWriteLock();
            return result;
        }

        public void Put(long id, IUserContext user, IPatientCountQueryDTO query)
        {
            sync.EnterWriteLock();
            store[id] = new ShrineUserQueryEntry(user, query, id);
            sync.ExitWriteLock();
        }

        public int DeleteOlderThan(DateTime earliest)
        {
            var deleteCount = 0;

            sync.EnterWriteLock();
            foreach (var user in All())
            {
                if (user.Added < earliest)
                {
                    store.Remove(user.QueryId, out var _);
                    deleteCount++;
                }
            }
            sync.ExitWriteLock();

            return deleteCount;
        }

        public IEnumerator<ShrineUserQueryEntry> GetEnumerator()
        {
            return All().GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    public class ShrineUserQueryEntry
    {
        public IUserContext User { get; }
        public IPatientCountQueryDTO Query { get; }
        public long QueryId { get; }
        public DateTime Added { get; set; }

        public ShrineUserQueryEntry(IUserContext user, IPatientCountQueryDTO query, long queryId)
        {
            User = user;
            Query = query;
            QueryId = queryId;
            Added = DateTime.Now;
        }
    }
}

