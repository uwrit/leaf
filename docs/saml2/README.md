# SAML2 Support

Leaf delegates support of SAML2 authentication and authorization mechanisms to the various battle-tested and well supported implementations from the open source community (e.g. [Shibboleth](https://wiki.shibboleth.net/confluence/display/SP3/Home), [Mellon](https://github.com/Uninett/mod_auth_mellon)). We rely on these implementations for integrating Leaf into your environment.

## Roles
- User
- CanIdentify
- Admin
- Super

## Configuration Questions
- How do you digest Shib Headers?
  - TODO
- How are role values mapped?
  - TODO

## Route Protection Setup
There are only two routes that must be protected by the SAML2 Service Provider (SP), all other routes are protected by requiring a JWT that can only be generated from a SAML2 SP protected endpoint.
- `/` --> react app.
- `/api/user` --> initial token generation endpoint.
