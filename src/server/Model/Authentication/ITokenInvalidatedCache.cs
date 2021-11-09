using System;
using System.Collections.Generic;

namespace Model.Authentication
{
    public interface ITokenInvalidatedCache
    {
        void Invalidate(InvalidatedToken token);
        bool IsInvalidated(Guid idNonce);
        void Overwrite(IEnumerable<InvalidatedToken> tokens);
    }
}