// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.Common;

namespace Model.Error
{
    public static class ErrorExtensions
    {
        public static void MapThrow(this DbException se)
        {
            DbError.ThrowFrom(se);
        }
    }

    internal static class DbError
    {
        internal static void ThrowFrom(DbException se)
        {
            switch (se.ErrorCode)
            {
                case (int)LeafErrorCode.BadArgument:
                    throw new LeafRPCException(LeafErrorCode.BadArgument, se.Message, se);
                case (int)LeafErrorCode.Forbidden:
                    throw new LeafRPCException(LeafErrorCode.Forbidden, se.Message, se);
                case (int)LeafErrorCode.NotFound:
                    throw new LeafRPCException(LeafErrorCode.NotFound, se.Message, se);
                case (int)LeafErrorCode.Conflict:
                    throw new LeafRPCException(LeafErrorCode.Conflict, se.Message, se);
            }
        }
    }
}
