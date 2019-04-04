using System.Collections.Generic;

namespace Model.Network
{
    public interface INetworkEndpointCache
    {
        IEnumerable<NetworkEndpoint> All();
        NetworkEndpoint Get(string issuer);
        void Overwrite(IEnumerable<NetworkEndpoint> endpoints);
        NetworkEndpoint Pop(string issuer);
        void Put(NetworkEndpoint endpoint);
        void Put(IEnumerable<NetworkEndpoint> endpoints);
    }
}