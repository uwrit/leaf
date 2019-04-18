# SAML2 Support

Leaf delegates support of SAML2 authentication and authorization mechanisms to the various battle-tested and well supported implementations from the open source community (e.g. [Shibboleth](https://wiki.shibboleth.net/confluence/display/SP3/Home)). We rely on these implementations for integrating Leaf into your environment.

## Route Protection Setup
There are only two routes that must be protected by the SAML2 Service Provider (SP), all other routes are protected by requiring a JWT that can only be generated from a SAML2 SP protected endpoint. In a non-federated deployment, you can also elect to protect the entire API surface.
- `/` --> react app.
- `/api/user` --> initial token generation endpoint.
