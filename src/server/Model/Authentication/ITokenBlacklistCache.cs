using System;
using System.Collections.Generic;

namespace Model.Authentication
{
    public interface ITokenBlacklistCache
    {
        void Blacklist(BlacklistedToken token);
        bool IsBlacklisted(Guid idNonce);
        void Overwrite(IEnumerable<BlacklistedToken> tokens);
    }
}