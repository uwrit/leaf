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
        - [IsMulti](#ismulti): `true`
        - [Delimiter](#delimeter):`";"`
    - [RoleMapping](#rolemapping)
      - [User](#user): `"urn:mace:<your_institution>.edu:groups:<user_group>"`
      - [Super](#super): `"urn:mace:<your_institution>.edu:groups:<super_user_group>"`
      - [Identified](#identified): `"urn:mace:<your_institution>.edu:groups:<user_group_that_can_see_phi>"`
      - [Admin](#admin): `"urn:mace:<your_institution>.edu:groups:<admin_group>"`
- [Compiler](#compiler)
  - [Alias](#alias): `"@"`
  - [SetPerson](#setperson): `"dbo.person_table`"
  - [SetEncounter](#setencounter): `"dbo.enc_table"`
  - [FieldPersonId](#fieldpersonid): `"person_id"`
  - [FieldEncounterId](#fieldencounterid): `"encounter_id"`
  - [FieldEncounterAdmitDate](#fieldencounteradmitdate): `"encounter_admit_date"`
  - [FieldEncounterDischargeDate](#fieldencounterdischargedate): `"encounter_discharge_date"`
- [Cohort](#cohort)
  - [SetCohort](#setcohort): `app.Cohort`
  - [FieldCohortPersonId](#fieldcohortpersonid): `PersonId`
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


### JWT
#### SigningKey
Environment Variable which points to the path [for the JWT signing key]((#creating-a-jwt-signing-key)). This should be `LEAF_JWT_KEY"`.
#### Password
Environment Variable which stores the password for the JWT signing key. This should be `LEAF_JWT_KEY_PW`.
#### Certificate
Environment Variable which points to the path of the `cert/pem` file. This should be `LEAF_JWT_CERT`.
#### Issuer
The `Issuer` is a global identifier in a Leaf instance that represents the origin of a JWT, and should be unique. The recommended practice for this is `leaf.<your_institution>.edu`, where `your_institution.edu` is a unique domain name. This is a suggested practice though, as this simply needs to be a globally unique string 200 characters or less.

### DB
#### App
Properties relating to the Leaf application database.
##### Connection
Environment Variable which contains the connection string for the Leaf application database. This should be `LEAF_APP_DB`.
##### DefaultTimeout
Default timeout length in seconds for database calls.
#### Clin
Properties relating to the clinical database that Leaf is to query.
##### Connection
Environment Variable which contains the connection string for the clinical database. This should be `LEAF_CLIN_DB`.
##### DefaultTimeout
Default timeout length in seconds for clinical queries. Depending on a variety of factors, certain queries may be longer-running and thus this should be relatively high, such as 120 to 180 seconds.

### Authentication
#### Mechanism
#### SessionTimeoutMinutes
#### InactivityTimeoutMinutes
#### LogoutURI
#### SAML2
##### Headers
##### ScopedIdentity

### Authorization
#### Mechanism
#### SAML2
##### HeadersMapping
###### Entitlements
####### Name
####### IsMulti
####### Delimeter

### Compiler
Properties relating to the Leaf SQL Compiler. Note that the explanataions below provide suggestions for OMOP and i2b2 clinical databases for convenience but are not limited to a particular data model.
#### SetPerson
The primary SQL table or view that has **one row per patient**, typically containing demographic information.
#### SetEncounter
The primary SQL table or view that has **one row per encounter**, typically containing information such as the visit type and admit and discharge dates.
#### FieldPersonId
The SQL field that must be present on every SQL object Leaf will query, and represents a field for unique identifiers for the patient. For standard data models such as OMOP this would be `person_id`, or in i2b2, `PATIENT_NUM`.
#### FieldEncounterId
The SQL field that must be present on every SQL object Leaf will query which has a one-to-many relationship to patients such that patients can have many over time. This field represents unique identifiers for encounters. For standard data models such as OMOP this would be `visit_occurrence_id`, or in i2b2, `ENCOUNTER_NUM`.
#### FieldEncounterAdmitDate
The SQL field that represents the admission date and time for a given encounter. This field should be present on the table or view defined in [SetEncounter](#setencounter). For standard data models such as OMOP this would be `visit_start_date`, or in i2b2, `START_DATE`.
#### FieldEncounterDischargeDate
The SQL field that represents the discharge date and time for a given encounter. This field should be present on the table or view defined in [SetEncounter](#setencounter). For standard data models such as OMOP this would be `visit_end_date`, or in i2b2, `END_DATE`.

### Cohort
Properties relating to the Leaf application patient cache.
#### RowLimit
The maximum number of patients that Leaf will cache upon running a cohort definition query. If a given query returns more unique patients than this value, Leaf will simply return the count and the user will not be able to see visualization information or row-level data.
#### ExportLimit
The maximum number of individual patients that Leaf will return to the client on the `Patient List` screen. If the total patients in the cohort exceed this value, only the first number of patients at or under this value will be returned to the client.

### Export
Properties relating to the export of data from Leaf to other applications.
#### REDCap
Properties relating to the export of data to a [REDCap](https://www.project-redcap.org/) instance. REDCap export is completely optional and will not be enabled if any of these values are omitted.
##### ApiURI
The absolute path to a given REDCap instance's root API path, such as `https://redcap.vanderbilt.edu/api` . Note that this should **not** end with `/`.
##### BatchSize
The number of rows of data per API request that Leaf will export to REDCap. This number should be relatively low, such as 10, and is used to give feedback to users as to progress and estimated time remaining.
##### RowLimit
The absolute maximium number of rows that Leaf will export to REDCap. Note that the Leaf client can exceed this number but will be prevented from exporting if this is exceeded. This is designed to prevent the export of larger datasets than REDCap is designed to manage.
##### Scope
The scoped identity for the REDCap instance that will be exported to. This is typically the `u.<insitution>.edu` in `sally_johnson@u.<institution>.edu`. When assigning user permissions via the REDCap API, Leaf will prepend the current user name (e.g. `sally_johnson`) to this value.
##### SuperToken
Environment Variable which stores the REDCap Super Token which is used for project creation. This should be `LEAF_REDCAP_SUPERTOKEN`.

### Client
Configuration properties which are sent to the Leaf client.
#### Map
Properties relating to the `Map` screen in the Leaf client.
![Map](https://github.com/uwrit/leaf/blob/master/docs/deploy/images/map_example.png "Map")
##### Enabled
Boolean value indicating whether to show a `Map` tab on the left of the screen. This must be `true` or `false`. If false, no tab will be shown and maps cannot be viewed.
##### TileURI
URI for the `tile layer` from which to request dynamic images and generate maps for, such as `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. Leaf uses [Leaflet.js](https://leafletjs.com/) and [React-Leaflet](https://react-leaflet.js.org/) for map generation. A list of Leaflet tile layer providers can be found here https://leaflet-extras.github.io/leaflet-providers/preview/.

#### Help
Properties relating to the `Help` floating button which appears in the lower-left of the screen.
##### Enabled 
Boolean value indicating whether to show the `Help` button. This must be `true` or `false`. If false, nothing will be shown.
###### Email
Email path with to direct user questions to, such as `<your_support_email>.edu`. If users click the `Help` button, their default email client will be triggered to draft a new email to this address.
###### URI
Similar to [Email](#email), but instead an absolute path to direct users to if clicked, such as a FAQ page. Note that **Email and URI are mutually exclusive**, and if both are defined the email workflow will begin.
