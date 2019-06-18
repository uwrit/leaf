// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

// TODO(cspital) add ctors for dbexception and new interface describing errorcode and message requirements.

namespace Model.Error
{
    /// <summary>
    /// Indicates that the database threw a Leaf specific error.
    /// Leaf databases MUST use and throw error codes specified in <see cref ="LeafErrorCode"/> to use this.
    /// </summary>
    /// <remarks>
    /// This exception is used to allow stored procedures in Leaf's application database to return HTTP StatusCode like constructs.
    /// </remarks>
    public class LeafRPCException : ApplicationException
    {
        public LeafErrorCode ErrorCode { get; private set; }
        public int StatusCode
        {
            get
            {
                return (int)ErrorCode - (int)LeafErrorCode.None;
            }
        }

        public LeafRPCException(LeafErrorCode code)
        {
            ErrorCode = code;
        }

        public LeafRPCException(LeafErrorCode code, string message) : base(message)
        {
            ErrorCode = code;
        }

        public LeafRPCException(LeafErrorCode code, string message, Exception innerException) : base(message, innerException)
        {
            ErrorCode = code;
        }
    }

    /// <summary>
    /// All valid error codes thrown from the database that can be mapped to a <see cref="LeafRPCException"/>.ErrorCode.
    /// </summary>
    public enum LeafErrorCode
    {
        None = 70_000,
        BadArgument = 70_400,
        Forbidden = 70_403,
        NotFound = 70_404,
        Conflict = 70_409,
        Internal = 70_500
    }
}
