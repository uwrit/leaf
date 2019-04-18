# Configuring the Leaf App Server
The application server hosts the [Leaf REST API](https://github.com/uwrit/leaf/tree/master/src/server), and serves as the intermediary between the [client app](https://github.com/uwrit/leaf/tree/master/src/ui-client) and [databases](https://github.com/uwrit/leaf/tree/master/src/db).

The API is written in C# and .NET Core, and can run in either Linux or Windows environments.

## Building the API
There are a variety of ways to build the API, the `dotnet` CLI tool supports both self-contained builds, as well as runtime dependent targets. Although .NET Core is cross-platform, some targets have some quirks that should be called out. If you're curious, you can review the build.sh script in the project's root directory. Self-contained builds produce an executable and embeds the entire .NET runtime in the build artifacts, this results in a much larger deployment payload but removes the need to install the .NET Core runtime on your target machine. Conversely, runtime dependent builds assume that the .NET Core runtime will be installed on your target machine and only includes the application and it's 3rd party dependencies in the artifact folder.

### Windows
Windows fully supports both self-contained builds as well as runtime dependent builds.

Self-contained:
```bash
dotnet publish -c Release -r win-x64 -o <output_dir>
```
Runtime dependent:
```bash
dotnet publish -c Release -o <output_dir>
```
### Red Hat Enterprise Linux (RHEL)/CentOS
RHEL7 and Cent7 only support runtime dependent builds and require.

On RHEL7 or Cent7 with .NET Core installed:
```bash
dotnet publish -c Release -o <output_dir>
```
On Windows/MacOS building for RHEL/Cent:
```bash
dotnet publish -c Release -o <output_dir> -r rhel.7-x64 --self-contained false /p:MicrosoftNETPlatformLibrary=Microsoft.NETCore.App
```

## Installation
1) [Creating a JWT Signing Key](#creating-a-jwt-signing-key)
2) [Setting Environment Variables](#setting-environment-variables)
3) [Configuring the appsettings.json file](#configuring-the-appsettingsjson-file)

## Creating a JWT Signing Key
The Leaf client and server communicate by [JSON Web Tokens, or JWTs](https://jwt.io/introduction/) (pronounced "JA-ts"). In a bash terminal, start by creating a JWT signing key. This allows the JWT recipient to verify the sender is who they say they are.
```bash
openssl req -nodes -x509 -newkey rsa:2048 -keyout key.pem \
    -out cert.pem -days 3650 -subj \
    "//CN=urn:leaf:issuer:leaf.<your_institution>.<tld>"
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
The [appsettings.json file](https://github.com/uwrit/leaf/blob/master/src/server/API/appsettings.json) acts as the central configuration file for your Leaf instance. This file can be found under `src/server/API/` relative to the Leaf repo root directory.

- [Jwt](#jwt)
  - [SigningKey](#signingkey): `"LEAF_JWT_KEY"`
  - [Password](#password): `"LEAF_JWT_KEY_PW"`
  - [Certificate](#certificate): `"LEAF_JWT_CERT"`
  - [Issuer](#issuer): `"urn:leaf:issuer:leaf.<your_institution>.edu"`
- [Db](#db)
  - [App](#app)
    - [Connection](#connection): `"LEAF_APP_DB"`
    - [DefaultTimeout](#defaulttimeout): `60`
  - [Clin](#clin)
    - [Connection](#connection-1): `"LEAF_CLIN_DB"`
    - [DefaultTimeout](#defaulttimeout-1): `120`
- [Authentication](#authentication)
  - [Mechanism](#mechanism): `"SAML2"`
  - [SessionTimeoutMinutes](#sessiontimeoutminutes): `480`
  - [InactivityTimeoutMinutes](#inactivitytimeoutminutes): `20`
  - [LogoutURI](#logouturi): `"https://<your_logout_page>"`
  - [SAML2](#saml2)
    - [Headers](#headers)
      - [ScopedIdentity](#scopedidentity): `"eppn"`
- [Authorization](#authorization)
  - [Mechanism](#mechanism-1): `"SAML2"`
  - [SAML2](#saml2-1)
    - [HeadersMapping](#headersmapping)
      - [Entitlements](#entitlements)
        - [Name](#name): `"gws_groups"`
        - [Delimiter](#delimeter):`";"`
    - [RoleMapping](#rolemapping) 
      - [User](#user): `"urn:mace:uw:groups:uw_rit_leaf_users"`
      - [Super](#super): `"urn:mace:uw:groups:uw_rit_leaf_supers"`
      - [Identified](#identified): `"urn:mace:uw:groups:uw_rit_leaf_phis"`
      - [Admin](#admin): `"urn:mace:uw:groups:uw_rit_leaf_admins"`
- [Compiler](#compiler)
  - [Alias](#alias): `"@"`
  - [SetPerson](#setperson): `"dbo.person_table`"
  - [SetEncounter](#setencounter): `"dbo.encounter_table"`
  - [FieldPersonId](#fieldpersonid): `"person_id"`
  - [FieldEncounterId](#fieldencounterid): `"encounter_id"`
  - [FieldEncounterAdmitDate](#fieldencounteradmitdate): `"encounter_admit_date"`
  - [FieldEncounterDischargeDate](#fieldencounterdischargedate): `"encounter_discharge_date"`
- [Cohort](#cohort)
  - [SetCohort](#setcohort): `"app.Cohort"`
  - [FieldCohortPersonId](#fieldcohortpersonid): `"PersonId"`
  - [RowLimit](#rowlimit): `200000`
  - [ExportLimit](#exportlimit): `5000`
- [Export](#export)
  - [REDCap](#redcap)
    - [ApiURI](#apiuri): `"https://<your_redcap_instance>.org/api"`
    - [BatchSize](#batchsize): `10`
    - [RowLimit](#rowlimit): `50000`
    - [Scope](#scope): `"<your_scope>.edu"`
    - [SuperToken](#supertoken): `"LEAF_REDCAP_SUPERTOKEN"`
- [Client](#client)
  - [Map](#map)
    - [Enabled](#enabled): `true`
    - [TileURI](#tileuri): `"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`
  - [Help](#help)
    - [Enabled](#enabled): `true`
    - [Email](#email): `"<your_support_email>.edu"`
    - [URI](#uri): `"https://<your_support_page>"`


## JWT
Properties relating to Leaf-issued JavaScript Web tokens (JWTs).
### SigningKey
Environment Variable which points to the path [for the JWT signing key](#creating-a-jwt-signing-key). This should be `LEAF_JWT_KEY`.
### Password
Environment Variable which stores the password for the JWT signing key. This should be `LEAF_JWT_KEY_PW`.
### Certificate
Environment Variable which points to the path of the `cert/pem` file. This should be `LEAF_JWT_CERT`.
### Issuer
The `Issuer` is a global identifier in a Leaf instance that represents the origin of a JWT, and should be unique. The recommended practice for this is `leaf.<your_institution>.edu`, where `<your_institution>.edu` is a unique domain name. This is a suggested practice though, as this simply needs to be a globally unique string 200 characters or less.
## DB
Properties relating to the Leaf application and clinical databases.
### App
Properties relating to the Leaf application database.
#### Connection
Environment Variable which contains the connection string for the Leaf application database. This should be `LEAF_APP_DB`.
#### DefaultTimeout
Default timeout length in seconds for database calls.
### Clin
Properties relating to the clinical database that Leaf is to query.
#### Connection
Environment Variable which contains the connection string for the clinical database. This should be `LEAF_CLIN_DB`.
#### DefaultTimeout
Default timeout length in seconds for clinical queries. Depending on a variety of factors, certain queries may be longer-running and thus this should be relatively high, such as 120 to 180 seconds.
## Authentication
```javascript
"Authentication": {
  "Mechanism": "SAML2",
  "SessionTimeoutMinutes": 480,
  "InactivityTimeoutMinutes": 20,
  "LogoutURI": "<your config specific fully qualified logout URI>",
  "SAML2": {
    "Headers": {
      "ScopedIdentity": "eppn"
    }
  }
}
```
### Mechanism
Either `SAML2` or `UNSECURED`.
- Choose `SAML2` in all non-development environments.
- Choose `UNSECURED` only in development settings.
### SessionTimeoutMinutes
This should be functionally equivalent to the Service Provider's configured `Sessions.lifetime` value. 28800 seconds would translate to 480 minutes.
### InactivityTimeoutMinutes
This should be functionally equivalent to the Service Provider's configured `Sessions.timeout` value. 3600 seconds would translate to 60 minutes.
### LogoutURI
This value is highly dependent on your specific Shibboleth configuration. Please read the [official documentation](https://wiki.shibboleth.net/confluence/display/SP3/Logout), additionally [NC State's documentation](https://docs.shib.ncsu.edu/docs/logout.html) provides excellent examples to follow.
### SAML2
Configures the SAML2 authentication integration layer.
#### Headers
Configures how authentication payload should be extracted from the request headers.
#### ScopedIdentity
Configures how the scoped identity header key will look.
## Authorization
```javascript
"Authorization": {
  "Mechanism": "SAML2",
  "SAML2": {
    "HeadersMapping": {
      "Entitlements": {
        "Name": "gws-groups",
        "Delimiter": ";"
      }
    },
    "RolesMapping": {
      "User": "urn:mace:users",
      "Super": "urn:mace:supers",
      "Identified": "urn:mace:phi",
      "Admin": "urn:mace:sudos"
    }
  }
}
```
### Mechanism
Either `SAML2`, `ACTIVEDIRECTORY`, or `UNSECURED`.
- Choose `SAML2` if a user's group memberships will arrive from the IdP.
- Choose `ACTIVEDIRECTORY` if Leaf should go source group membership directly from an Active Directory instance.
- `UNSECURED` is only to be used in development settings.`
### SAML2
Configures the SAML2 authorization integration layer.
#### HeadersMapping
Configures how the entitlement payload should be extracted from the request headers.
##### Entitlements
Configures how the entitlement header will look.
###### Name
Configures the header key to look for.
###### Delimeter
Configures the character or string used to delimit the list of groups.
#### RoleMapping
Configures how groups are mapped to Leaf roles. All roles are required to be mapped, even if they map to the same groups. For example, you may wish for all super users to be admins, in that case you may map those roles to the same group.
## Compiler
Properties relating to the Leaf SQL Compiler. If you are using common data models such as OMOP or i2b2, feel free to simply use the below templates:

OMOP v5:
```javascript
"Compiler": {
  "Alias": "@",
  "SetPerson": "dbo.person",
  "SetEncounter": "dbo.visit_occurrence",
  "FieldPersonId": "person_id",
  "FieldEncounterId": "visit_occurrence_id",
  "FieldEncounterAdmitDate": "visit_start_date",
  "FieldEncounterDischargeDate": "visit_end_date"
}
```

i2b2:
```javascript
"Compiler": {
  "Alias": "@",
  "SetPerson": "dbo.PATIENT_DIMENSION",
  "SetEncounter": "dbo.VISIT_DIMENSION",
  "FieldPersonId": "PATIENT_NUM",
  "FieldEncounterId": "ENCOUNTER_NUM",
  "FieldEncounterAdmitDate": "START_DATE",
  "FieldEncounterDischargeDate": "END_DATE"
}
```

### Alias
The global character that acts as a indicator for inserting an alias for a `SQL Set`. Typically the `@` character is used. 

Why is this needed? Consider the `SQL` statement:

```sql
SELECT E.*
FROM dbo.Person AS P
     INNER JOIN dbo.Encounter AS E
        ON P.PersonId = E.PersonId
WHERE PersonId = 123        
```
This would return an error because `PersonId` in the `WHERE` clause could be from either `dbo.Person` or `dbo.Encounter`. To solve this example, we could simply change this to `WHERE P.PersonId = 123`, with `P.` preceding `PersonId`.

Because Leaf writes highly variable `SQL`, it needs a hint of where to insert aliases for a given `SQL Set` to ensure errors like the above do not happen. An example of these using the `@` character could be a date field, `@.observation_date`, or a `WHERE` clause, `@.lab_type = 'WBC'`. Note that in both cases the `@` character acts as a placeholder and would be replaced at runtime with a real alias.
### SetPerson
The primary SQL table or view that has **one row per patient**, typically containing demographic information.
### SetEncounter
The primary SQL table or view that has **one row per encounter**, typically containing information such as the visit type and admit and discharge dates.
### FieldPersonId
The SQL field that must be present on every SQL object Leaf will query and contains unique identifiers for patients in the database.
### FieldEncounterId
The SQL field that must be present on every SQL object Leaf will query which has a one-to-many relationship to patients, such that patients can have many over time. This field represents unique identifiers for encounters.
### FieldEncounterAdmitDate
The SQL field that represents the admission date and time for a given encounter. This field should be present on the table or view defined in [SetEncounter](#setencounter).
### FieldEncounterDischargeDate
The SQL field that represents the discharge date and time for a given encounter. This field should be present on the table or view defined in [SetEncounter](#setencounter).

## Cohort
Properties relating to the Leaf application patient cache.
### SetCohort
The Leaf application database's patient ID cache table. This should be set to `app.Cohort`.
### FieldCohortPersonId
The Leaf application database's patient ID field. This should be set to `PersonId`.
### RowLimit
The maximum number of patients that Leaf will cache upon running a cohort definition query. If a given query returns more unique patients than this value, Leaf will simply return the count and the user will not be able to see visualization information or row-level data.
### ExportLimit
The maximum number of individual patients that Leaf will return to the client on the `Patient List` screen. If the total patients in the cohort exceed this value, only the first number of patients at or under this value will be returned to the client.

## Export
Properties relating to the export of data from Leaf to other applications.
### REDCap
Properties relating to the export of data to a [REDCap](https://www.project-redcap.org/) instance. REDCap export is completely optional and will not be enabled if any of these values are omitted.
#### ApiURI
The absolute path to a given REDCap instance's root API path, such as `https://redcap.vanderbilt.edu/api` . Note that this should **not** end with `/`.
#### BatchSize
The number of rows of data per API request that Leaf will export to REDCap. This number should be relatively low, such as 10, and is used to give feedback to users as to progress and estimated time remaining.
#### RowLimit
The absolute maximium number of rows that Leaf will export to REDCap. Note that the Leaf client can exceed this number if users are simply viewing the `Patient List`, but they will be prevented from exporting. This is designed to prevent the export of larger datasets than REDCap is designed to manage.
#### Scope
The scoped identity for the REDCap instance that will be exported to. This is typically the `u.<insitution>.edu` in `sally_johnson@u.<institution>.edu`. When assigning user permissions via the REDCap API, Leaf will prepend the current user name (e.g. `sally_johnson`) to this value.
#### SuperToken
Environment Variable which stores the REDCap Super Token which is used for project creation. This should be `LEAF_REDCAP_SUPERTOKEN`.

## Client
Configuration properties which are sent to the Leaf client.
### Map
Properties relating to the `Map` screen in the Leaf client.
![Map](https://github.com/uwrit/leaf/blob/master/docs/deploy/images/map_example.png "Map")
#### Enabled
Boolean value indicating whether to show a `Map` tab on the left of the screen. This must be `true` or `false`. If false, no tab will be shown and maps cannot be viewed.
#### TileURI
URI for the `tile layer` from which to request dynamic images and generate maps for, such as `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. Leaf uses [Leaflet.js](https://leafletjs.com/) and [React-Leaflet](https://react-leaflet.js.org/) for map generation. A list of Leaflet tile layer providers can be found here https://leaflet-extras.github.io/leaflet-providers/preview/.

### Help
Properties relating to the `Help` floating button which appears in the lower-left of the screen.
#### Enabled 
Boolean value indicating whether to show the `Help` button. This must be `true` or `false`. If false, nothing will be shown.
#### Email
Email path with to direct user questions to, such as `<your_support_email>.edu`. If users click the `Help` button, their default email client will be triggered to draft a new email to this address.
#### URI
Similar to [Email](#email), but instead an absolute path to direct users to if clicked, such as a FAQ page. Note that **Email and URI are mutually exclusive**, and if both are defined the email workflow will begin.