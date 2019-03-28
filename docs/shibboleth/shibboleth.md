# Shibboleth Support

This document details requirements for Shibboleth support in the Leaf application.

### Roles
- User
- CanIdentify
- Admin
- Super

### Configuration Questions
- How do you digest Shib Headers?
  - TODO
- How are role values mapped?
  - TODO

### Apache Setup
- Require Shibboleth on `/` react app.
- Require Shibboleth on `/api/user`.
- Everything else does not require Shibboleth, tokens take over.
