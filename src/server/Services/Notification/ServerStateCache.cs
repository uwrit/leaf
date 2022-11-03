// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Notification;
using System.Threading;

namespace API.Jwt
{
    public class ServerStateCache : IServerStateCache
    {
        readonly ReaderWriterLockSlim sync;
        private ServerState serverState;

        public ServerStateCache()
        {
            sync = new ReaderWriterLockSlim();
            serverState = new ServerState();
        }

        public ServerStateCache(ServerState initialState)
        {
            sync = new ReaderWriterLockSlim();
            serverState = initialState;
        }

        public ServerState GetServerState()
        {
            return serverState;
        }

        public void Overwrite(ServerState newState)
        {
            sync.EnterWriteLock();
            try
            {

                serverState = newState;
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }
    }
}
