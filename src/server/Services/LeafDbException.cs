// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;

namespace Services
{
    public class LeafDbException : ApplicationException
    {
        public LeafSqlError ErrorCode { get; private set; }
        public int StatusCode
        {
            get
            {
                return (int)ErrorCode - (int)LeafSqlError.None;
            }
        }

        public LeafDbException(LeafSqlError code)
        {
            ErrorCode = code;
        }

        public LeafDbException(LeafSqlError code, string message) : base(message)
        {
            ErrorCode = code;
        }

        public LeafDbException(LeafSqlError code, string message, Exception innerException) : base(message, innerException)
        {
            ErrorCode = code;
        }

        public static void ThrowFrom(SqlException se)
        {
            switch (se.ErrorCode)
            {
                case (int)LeafSqlError.BadArgument:
                    throw new LeafDbException(LeafSqlError.BadArgument, se.Message, se);
                case (int)LeafSqlError.Forbidden:
                    throw new LeafDbException(LeafSqlError.Forbidden, se.Message, se);
                case (int)LeafSqlError.NotFound:
                    throw new LeafDbException(LeafSqlError.NotFound, se.Message, se);
                case (int)LeafSqlError.Conflict:
                    throw new LeafDbException(LeafSqlError.Conflict, se.Message, se);
            }
        }
    }
}
