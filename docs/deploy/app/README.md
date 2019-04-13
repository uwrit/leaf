# Configuring the Leaf App Server
The application server hosts the [Leaf REST API](https://github.com/uwrit/leaf/tree/master/src/server), and serves as the intermediary between the [client app](https://github.com/uwrit/leaf/tree/master/src/ui-client) and [databases](https://github.com/uwrit/leaf/tree/master/src/db).

The API is written in C# and .NET Core, and can run in either Linux or Windows environments.

## Installation
1) [Creating a JWT Signing Key](#creating-a-jwt-signing-key)
2) [Setting Environment Variables](#setting-environment-variables)
3) [Configuring the appsettings.json file](#configuring-the-appsettingsjson-file)

## Creating a JWT Signing Key
The Leaf client and server communicate by [JSON Web Tokens, or JWTs](https://jwt.io/introduction/) (pronounced "JA-ts"). In a bash terminal, start by creating a JWT signing key. This allows the JWT recipient to verify the sender is who they say they are.
```bash
openssl req -nodes -x509 -newkey rsa:2048 -keyout key.pem \
    -out cert.pem -days 3650 -subj \
    "//CN=urn:leaf:issuer:leaf.<your_institution>.edu"
```
```bash
openssl pkcs12 -in cert.pem -inkey key.pem \
    -export -out leaf.pfx -password pass:<your_pass>
```

## Setting Environment Variables
Sensitive configuration data are stored in [environment variables](https://en.wikipedia.org/wiki/Environment_variable). Set environment variables on your server based on the examples below (making sure that the file paths, password, and connection strings are appropriate for your environment). The paths are relative to the path selected during key creation.
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
The [appsettings.json file](https://github.com/uwrit/leaf/blob/master/src/server/API/appsettings.json) acts as the central configuration file for your Leaf instance. The items below are examples of a given configuration unless otherwise noted.

- [Jwt](#jwt)
  - SigningKey: `"LEAF_JWT_KEY"`
  - Password: `"LEAF_JWT_KEY_PW"`
  - Certificate: `"LEAF_JWT_CERT"`
  - Issuer: `"urn:leaf:issuer:leaf.<your_institution>.edu"`
- [Db](#db)
  - App
    - Connection: `"LEAF_APP_DB"`
    - DefaultTimeout: `60`
  - Clin
    - Connection: `"LEAF_CLIN_DB"`
    - DefaultTimeout: `120`
- [Authentication](#authentication)
  - Mechanism: `"SAML2"`
  - SessionTimeoutMinutes: `480`
  - InactivityTimeoutMinutes: `20`
  - LogoutURI: `"https://<your_logout_page>"`
  - SAML2
    - Headers
      - ScopedIdentity: `"eppn"`
- [Authorization](#authorization)
  - Mechanism: `"SAML2"`
  - SAML2
    - HeadersMapping
      - Entitlements
        - Name: `"gws_groups"`
        - IsMulti: `true`
        - Delimiter:`";"`
    - RoleMapping
      - User: `"urn:mace:<your_institution>.edu:groups:<user_group>"`
      - Super: `"urn:mace:<your_institution>.edu:groups:<super_user_group>"`
      - Identified: `"urn:mace:<your_institution>.edu:groups:<user_group_that_can_see_phi>"`
      - Admin: `"urn:mace:<your_institution>.edu:groups:<admin_group>"`
- [Compiler](#compiler)
  - [Alias](#alias): `"@"`
  - [SetPerson](#setperson): `"dbo.person_table`"
  - [SetEncounter](#setencounter): `"dbo.enc_table"`
  - [FieldPersonId](#fieldpersonid): `"person_id"`
  - [FieldEncounterId](#fieldencounterid): `"encounter_id"`
  - [FieldEncounterAdmitDate](#fieldencounteradmitdate): `"encounter_admit_date"`
  - [FieldEncounterDischargeDate](#fieldencounterdischargedate): `"encounter_discharge_date"`
- [Cohort](#cohort)
  - SetCohort: `app.Cohort`
  - FieldCohortPersonId: `PersonId`
  - [RowLimit](#rowlimit): `200000`
  - [ExportLimit](#exportlimit): `5000`
- [Export](#export)
  - [REDCap](#redcap)
    - ApiURI: `"https://<your_redcap_instance>.org/api"`
    - BatchSize: `10`
    - RowLimit: `50000`
    - Scope: `"<your_scope>.edu"`
    - SuperToken: `"LEAF_REDCAP_SUPERTOKEN"`
- [Client](#client)
  - [Map](#map)
    - Enabled: `true`
    - TileURI: `"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`
  - [Help](#help)
    - Enabled: `true`
    - Email: `"<your_support_email>.edu"`
    - URI: `"https://<your_support_page>"`


### JWT
### DB
### Authentication
### Authorization
### Compiler
#### SetPerson
#### SetEncounter
#### FieldPersonId
#### FieldEncounterId
#### FieldEncounterAdmitDate
#### FieldEncounterDischargeDate
### Cohort
#### RowLimit
#### ExportLimit
### Export
#### REDCap
### Client
#### Map
#### Help
