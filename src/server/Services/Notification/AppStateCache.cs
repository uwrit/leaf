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
    public class AppStateCache : IAppStateCache
    {
        readonly ReaderWriterLockSlim sync;
        private AppState appState;

        public AppStateCache()
        {
            sync = new ReaderWriterLockSlim();
            appState = new AppState();
        }

        public AppStateCache(AppState initialState)
        {
            sync = new ReaderWriterLockSlim();
            appState = initialState;
        }

        public AppState GetAppState()
        {
            return appState;
        }

        public void Overwrite(AppState newState)
        {
            sync.EnterWriteLock();
            try
            {

                appState = newState;
            }
            finally
            {
                sync.ExitWriteLock();
            }
        }
    }
}
