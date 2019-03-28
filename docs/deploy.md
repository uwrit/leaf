# Leaf AWS Deployment Steps

## Create JWT Signing Key
- `openssl req -nodes -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -subj "//CN=urn:leaf:issuer:leaf.rit.uw.edu"`
- `openssl pkcs12 -in cert.pem -inkey key.pem -export -out leaf.pfx -password pass:<insertpass>`

## Set Environment Variables
These are relative to the path selected during key selection.
- `LEAF_JWT_CERT=/.keys/leaf/cert.pem`
- `LEAF_JWT_KEY=/.keys/leaf/leaf.pfx`
- `LEAF_JWT_KEY_PW=<insertpass>`
- `LEAF_APP_DB=<LeafDB Connection String>`
- `LEAF_CLIN_DB=<Clinical DB Connection String>`
- `SERILOG_DIR=/var/log/leaf`


##### Connection String should be of the form:
`Server=<server>;Database=<dbname>;uid=sa;Password=<dbpassword>;`


## Update the appsettings.json file
- `Jwt`
  - `Issuer = urn:leaf:issuer:leaf.rit.uw.edu`
- `Authentication`
  - `Mechanism = SAML2`
  - `SessionTimeoutMinutes = 480`
  - `SAML2`
    - `Headers`
      - `ScopedIdentity = eppn`
- `Authorization`
  - `Mechanism = SAML2`
  - `SAML2`
    - `HeadersMapping`
      - `Entitlements`
        - `Name = gws_groups`
        - `IsMulti = true`
        - `Delimiter = ;`
    - `RoleMapping`
      - `User = urn:mace:washington.edu:groups:uw_rit_leaf_users`
      - `Super = urn:mace:washington.edu:groups:uw_rit_leaf_users`
      - `Identified = urn:mace:washington.edu:groups:uw_rit_leaf_users`
      - `Admin = urn:mace:washington.edu:groups:uw_rit_leaf_users`


## Update the respective databases
- Cross-pollinate the certificates from API instances.
