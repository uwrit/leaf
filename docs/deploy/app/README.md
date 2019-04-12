# Configuring the Leaf App Server
The application server hosts the [Leaf REST API](https://github.com/uwrit/leaf/tree/master/src/server), and is the 

## Creating a JWT Signing Key
```bash
openssl req -nodes -x509 -newkey rsa:2048 -keyout key.pem \
    -out cert.pem -days 3650 -subj \
    "//CN=urn:leaf:issuer:leaf.<your_institution>.edu"
```
```bash
openssl pkcs12 -in cert.pem -inkey key.pem \
    -export -out leaf.pfx -password pass:<insertpass>
```

## Setting Environment Variables
These are relative to the path selected during key selection.
```bash
LEAF_JWT_CERT=/.keys/leaf/cert.pem
LEAF_JWT_KEY=/.keys/leaf/leaf.pfx
LEAF_JWT_KEY_PW=<insertpass>
LEAF_APP_DB=<leaf_app_db_connection_string>
LEAF_CLIN_DB=<clinical_db_connection_string>
SERILOG_DIR=/var/log/leaf
```
Note that the connection string variables `LEAF_APP_DB` and `LEAF_CLIN_DB` should be of the form:
```
Server=<server>;Database=<dbname>;uid=sa;Password=<dbpassword>;
```

## Configuring the appsettings.json file
```json
- Jwt
  - Issuer = urn:leaf:issuer:leaf.<your_institution>.edu
- Authentication
  - Mechanism = SAML2
  - SessionTimeoutMinutes = 480
  - SAML2
    - Headers
      - ScopedIdentity = eppn
- Authorization
  - Mechanism = SAML2
  - SAML2
    - HeadersMapping
      - Entitlements
        - Name = gws_groups
        - IsMulti = true
        - Delimiter = ;
    - RoleMapping
      - User = urn:mace:washington.edu:groups:<user_group>
      - Super = urn:mace:washington.edu:groups:<super_user_group>
      - Identified = urn:mace:washington.edu:groups:<user_group_that_can_see_phi>
      - Admin = urn:mace:washington.edu:groups:<admin_group>
```