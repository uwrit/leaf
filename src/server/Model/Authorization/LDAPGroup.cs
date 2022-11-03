// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading;
using System.Linq;

namespace Model.Authorization
{
    public class LDAPGroup
    {
        HashSet<string> members;
        readonly ReaderWriterLockSlim sync;

        public string Name { get; private set; }

        public LDAPGroup(string name)
        {
            sync = new ReaderWriterLockSlim();
            Name = name;
            members = new HashSet<string>();
        }

        public LDAPGroup(string name, IEnumerable<string> members)
        {
            sync = new ReaderWriterLockSlim();
            Name = name;
            members = members.ToHashSet();
        }

        public LDAPGroup(string name, HashSet<string> members)
        {
            sync = new ReaderWriterLockSlim();
            Name = name;
            this.members = members;
        }

        public bool IsMember(string identity)
        {
            sync.EnterReadLock();
            try
            {
                return members.Contains(identity);
            }
            finally
            {
                sync.ExitReadLock();
            }
        }

        public void Overwrite(IEnumerable<string> newMembers)
        {
            var set = newMembers.ToHashSet();

            sync.EnterWriteLock();
            try
            {
                members = set;
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }
    }
}
