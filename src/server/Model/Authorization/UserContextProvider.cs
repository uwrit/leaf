// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Error;

namespace Model.Authorization
{
	public interface IUserContextProvider
	{
		void SetUserContext(IUserContext userContext);
		IUserContext GetUserContext();
    }

	public class UserContextProvider : IUserContextProvider
    {
		IUserContext userContext;

        public UserContextProvider(IUserContext userContext = null)
        {
			if (userContext != null)
			{ 
				this.userContext = userContext;
			}
        }

        public void SetUserContext(IUserContext userContext)
		{
			this.userContext = userContext;
		}

		public IUserContext GetUserContext()
		{
			if (userContext == null) throw new LeafAuthorizationException("No user context is available");
			return userContext;
		}
    }
}

