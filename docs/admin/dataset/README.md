# Extracting Data for a Cohort: Datasets
- [Introduction](#introduction)
- [Basic Demographics](#basic-demographics)
- [Adding New Datasets](#adding-new-datasets)
- [Dataset Templates Reference](#dataset-template-reference)
  - [Observation](#observation)
  - [Encounter](#encounter)
  - [Basic Demographics](#basic-demographics-1)
  - [Condition](#condition)
  - [Procedure](#procedure)
  - [Immunization](#immunization)
  - [Allergy](#allergy)
  - [MedicationRequest](#medicationrequest)
  - [MedicationAdministration](#medicationadministration)

## Introduction
At a high level, Leaf aims to do two things:

1) Identify cohorts of patients (using [Concepts](https://github.com/uwrit/leaf/blob/master/docs/admin/concept/README.md)).
2) Extract data for those patients.

After users identify a Cohort in (1), they can next do (2). In Leaf, extracted data for a cohort are called "datasets", which is short-hand for `Patient List Datasets`. This refers to the row-level patient data you can see on the `Patient List` screen.

Each dataset is based on templates, or denormalized tabular representations of [FHIR resources](https://www.hl7.org/fhir/resourcelist.html). In order to add datasets, administrators can define SQL queries whose column names and types match a given template. 

**Note that we also have an existing issue to add dynamic datasets which would allow admins to define completely custom datasets with arbitrary columns https://github.com/uwrit/leaf/issues/95. If you think these would be helpful to you please comment and add your thoughts.**

### Basic Demographics
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/dataset_intro.gif"/></p>

The core dataset Leaf uses is `Basic Demographics`. The output of this query is used to both populate the initial `Patient List` screen, as well as populate the bar charts on the `Visualize` screen.

The fields in `Basic Demographics` represent a denormalized combination of the FHIR [Person](https://www.hl7.org/fhir/person.html) and [Patient](https://www.hl7.org/fhir/patient.html) resources.

The expected columns are:

| Name              | Type      | 
| ----------------- | --------- |
| personId          | nvarchar  |
| addressPostalCode | nvarchar  |
| addressState      | nvarchar  |
| birthDate         | datetime  |
| deceasedDateTime  | datetime  |
| ethnicity         | nvarchar  |
| gender            | nvarchar  |
| deceasedBoolean   | bit       |
| hispanicBoolean   | bit       |
| marriedBoolean    | bit       |
| language          | nvarchar  |
| maritalStatus     | nvarchar  |
| mrn               | nvarchar  |
| name              | nvarchar  |
| race              | nvarchar  |
| religion          | nvarchar  |

### Key Points
- **All columns in `Basic Demongraphics` are required** - Leaf will automatically date-shift, calculate ages, and remove the HIPAA identified columns (`mrn` and `name`) depending on if the user is in `Identified` or `De-identified` mode.
- **The Patient Identifier column must be called *personId*** - While Leaf Concepts are flexible regarding the [column name for patient identifiers](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#fieldpersonid), datasets are more restrictive and require a predictable, specific column name. This ensures alignment of Leaf datasets when multiple Leaf instances are federated, among other reasons.
- **It's okay if you don't have data for every column** - Though every column must be returned in the SQL statement, it's fine to hard-code it as 'Unknown', etc. For example, `religion = 'Unknown'`.
- **The `isDeceased`, `isHispanic`, and `isMarried` bit/boolean columns are used in the bar charts on the `Visualize` screen** - These are needed because Leaf does not enforce specific values for the `ethnicity` or `maritalStatus` columns (so you have flexiblity in showing your data as it is), but in return you need to define these true/false columns yourself. For example, `hispanicBoolean = CAST(CASE ethnicity WHEN 'Hispanic or Latino' THEN 1 ELSE 0 END AS BIT)`.
- **Values in `gender` must be `F`, `Female`, `M`, or `Male`** - This allows them to be predictably aggregated in bar charts (case insensitive).

### Defining the Basic Demographics Query
Currently the Basic Demographics query (and other datasets) must be added via SQL directly to the database, though we intend to create functionality in the `Admin` screen to make this easier in the future.

1) Define a query in SQL that returns the columns defined above. Here is how we configure the [CMS SynPuf OMOP dataset](https://www.cms.gov/Research-Statistics-Data-and-Systems/Downloadable-Public-Use-Files/SynPUFs/DE_Syn_PUF.html) demographics query, for example:

```sql
SELECT 
    personId = CAST(p.person_id AS NVARCHAR)
  , addressPostalCode = l.zip
  , addressState = p.location_state
  , birthDate = p.birth_datetime
  , deceasedDateTime = p.death_date
  , ethnicity = p.ethnicity
  , gender = CASE WHEN p.gender = 'F' THEN 'female' WHEN p.gender = 'M' THEN 'male' ELSE 'other' END
  , [language] = 'Unknown'
  , maritalStatus = 'Unknown'
  , marriedBoolean = CAST(0 AS BIT)
  , hispanicBoolean = CAST(CASE WHEN p.ethnicity_code = 38003563 THEN 1 ELSE 0 END AS BIT)
  , deceasedBoolean = CAST(CASE WHEN p.death_date IS NULL THEN 0 ELSE 1 END AS BIT)
  , [name] = 'Unknown Unknown'
  , mrn = 'Unknown'
  , race = p.race
  , religion = 'Unknown'
FROM v_person p 
     LEFT JOIN [location] l ON p.location_id = l.location_id
```

2) INSERT the query into the `app.DemographicQuery` table.

Using the above example:

```sql
DECLARE @shape INT = 3
DECLARE @query NVARCHAR(MAX) = 
'SELECT 
    personId = CAST(p.person_id AS NVARCHAR)
  , addressPostalCode = l.zip
  , addressState = p.location_state
  , birthDate = p.birth_datetime
  , deceasedDateTime = p.death_date
  , ethnicity = p.ethnicity
  , gender = CASE WHEN p.gender = ''F'' THEN ''female'' 
                  WHEN p.gender = ''M'' THEN ''male'' 
                  ELSE ''other'' 
             END
  , [language] = ''Unknown''
  , maritalStatus = ''Unknown''
  , marriedBoolean = CAST(0 AS BIT)
  , hispanicBoolean = CAST(CASE WHEN p.ethnicity_code = 38003563 THEN 1 ELSE 0 END AS BIT)
  , deceasedBoolean = CAST(CASE WHEN p.death_date IS NULL THEN 0 ELSE 1 END AS BIT)
  , [name] = ''Unknown Unknown''
  , mrn = ''Unknown'' 
  , race = p.race
  , religion = ''Unknown''
FROM v_person p 
     LEFT JOIN [location] l ON p.location_id = l.location_id'

INSERT [app].[DemographicQuery] ([Lock], [SqlStatement], [Shape], [LastChanged], [ChangedBy]) 
VALUES 
(   
    'X'
  , @query
  , @shape
  , GETDATE()
  , '<my_user_name>'
)
```

Note that the `Shape` field in Leaf happens to be value `3`, so it needs to be hard-coded here.

## Adding New Datasets
If you've successfully added the `Basic Demographics` dataset and can see data returned in the `Patient List` screen in the Leaf user interface, you're off to a great start. Inevitably though you'll likely want to allow users to add more datasets beyond demographics.

To do so, we'll need to add rows in the [app.DatasetQuery](https://github.com/uwrit/leaf/blob/master/src/db/obj/app.DatasetQuery.Table.sql) table in the Leaf application database.

Let's start with an example. In this case, we'll add a [Platelet](https://en.wikipedia.org/wiki/Platelet) dataset which will represent platelet count laboratory tests.

1) To begin, we need to decide how best to visually organize the platelets dataset, specifically whether to place it under a category or not. Visually this would look like:

Under a 'Labs' Category
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/dataset_category.png"/></p>

Uncategorized
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/dataset_nocategory.png"/></p>

In most cases, we recommend categorizing datasets to provide context to users, particularly as your datasets grow in number. To add a category, simply insert a row into the [app.DatasetQueryCategory](https://github.com/uwrit/leaf/blob/master/src/db/obj/app.DatasetQueryCategory.Table.sql) table. You'll use the `Id` created as a foreign key to the `app.DatasetQuery` `CategoryId` field.

```sql
INSERT INTO [app].[DatasetQueryCategory] (Category, Created)
SELECT 'Labs', GETDATE()

SELECT Id, Category
FROM [app].[DatasetQueryCategory]
```

| Id | Category |
| -- | -------- |
| 1  | Labs     |

2) Next, we'll determine which dataset template is the best fit for this new dataset by checking the [Dataset Templates Reference](#dataset-templates-reference) below. In FHIR labs are generally represented as [Observations](#observation), so let's use that.

For demonstrative purposes we'll use data from the [MIMIC Critical Care Database](https://mimic.physionet.org/), but the methods here can be applied to other data models as well.

Let's suppose we have a SQL table or view representing labs (including platelets) called `dbo.v_LABEVENTS` that looks like this:

| SUBJECT_ID | HADM_ID | LABEL          | LOINC_CODE | CHARTIME   | VALUE | VALUENUM | VALUEUOM |
| ---------- | ------- | -------------- | ---------- | ---------- | ----- | -------- | -------- |
| 1          | 100     | Platelet Count | 777-3      | 2101-10-04 | 301   | 301      | K/uL     |      
| 1          | 200     | Platelet Count | 777-3      | 2101-02-10 | 192   | 192      | K/uL     | 
| 2          | 300     | Platelet Count | 777-3      | 2101-12-22 | 533   | 533      | K/uL     |

To output a SQL set satisfying the [Observation](#observation) template columns, we may use:

```sql
SELECT 
	personId      = CAST(SUBJECT_ID AS NVARCHAR)
  , encounterId   = CAST(HADM_ID AS NVARCHAR)
  , category      = 'lab'
  , code          = LOINC_CODE
  , effectiveDate = CHARTTIME
  , valueString   = VALUE
  , valueQuantity = VALUENUM
  , valueUnit     = VALUEUOM
FROM [dbo].[v_LABEVENTS]
WHERE LABEL = 'Platelet Count'
```

Which would output:

| personId   | encounterId | category | code  | effectiveDate   | valueString | valueQuantity | valueUnit |
| ---------- | ----------- | -------- | ----- | --------------- | ----------- | ------------- | --------- |
| 1          | 100         | lab      | 777-3 | 2101-10-04      | 301         | 301           | K/uL      |      
| 1          | 200         | lab      | 777-3 | 2101-02-10      | 192         | 192           | K/uL      | 
| 2          | 300         | lab      | 777-3 | 2101-12-22      | 533         | 533           | K/uL      |

3) Next, we need to insert a row into the `app.DatasetQuery` table:

```sql
DECLARE @categoryId INT      = 1
DECLARE @shape INT           = 1  -- Observation dataset shape id
DECLARE @query NVARCHAR(MAX) = 
'SELECT 
    personId      = CAST(SUBJECT_ID AS NVARCHAR)
  , encounterId   = CAST(HADM_ID AS NVARCHAR)
  , category      = ''lab''
  , code          = LOINC_CODE
  , effectiveDate = CHARTTIME
  , valueString   = VALUE
  , valueQuantity = VALUENUM
  , valueUnit     = VALUEUOM
FROM [dbo].[v_LABEVENTS]
WHERE LABEL = ''Platelet Count'''

INSERT INTO [app].[DatasetQuery] ([Shape],[Name],[CategoryId],[SqlStatement],
                                  [Created],[CreatedBy],[Updated],[UpdatedBy])
SELECT 
    @shape
  , 'Platelet Count'
  , @categoryId
  , @query
  , GETDATE()
  , '<my_user_name'
  , GETDATE()
  , '<my_user_name'
```

4) Now just test it!

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/dataset_add.gif"/></p>

If you're able to navigate to the `Patient List` and add the new dataset, congratulations! If you run into errors, be sure to check the Leaf logs.

## Dataset Templates Reference
As mentioned in the [Introduction](#introduction), datasets are denormalized, tabular representations of [FHIR resources](https://www.hl7.org/fhir/resourcelist.html).

> Note: SQL Columns of type `numeric` listed below can be `INT`, `FLOAT`, `MONEY`, `NUMERIC`, `REAL`, `SMALLINT`, `SMALLMONEY`, or `DECIMAL`.

## Observation
*Dataset Shape **1*** - A representation of the [FHIR Observation Resource](https://www.hl7.org/fhir/observation.html).

The FHIR documention suggests using this resource for:
> - Vital signs such as body weight, blood pressure, and temperature
> - Laboratory Data like blood glucose, or an estimated GFR
> - Imaging results like bone density or fetal measurements
> - Clinical Findings such as abdominal tenderness
> - Device measurements such as EKG data or Pulse Oximetry data
> - Clinical assessment tools such as APGAR or a Glasgow Coma Score
> - Personal characteristics: such as eye-color
> - Social history like tobacco use, family support, or cognitive status
> - Core characteristics like pregnancy status, or a death assertion

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Observation.cs)):

| Name               | Type      | Required | Is PHI |
| -----------------  | --------- | -------- | ------ |
| personId           | nvarchar  | true     | true   |
| encounterId        | nvarchar  | true     | true   |
| category           | nvarchar  | true     |        |
| code               | nvarchar  | true     |        |
| effectiveDate      | datetime  | true     | true   |
| referenceRangeLow  | datetime  |          |        |
| referenceRangeHigh | nvarchar  |          |        |
| specimenType       | nvarchar  |          |        |
| valueString        | nvarchar  | true     |        |
| valueQuantity      | numeric   |          |        |
| valueUnit          | nvarchar  |          |        |

## Encounter
*Dataset Shape **2*** - A representation of the [FHIR Encounter Resource](https://www.hl7.org/fhir/encounter.html).

The FHIR documention describes this as:
> A patient encounter is characterized by the setting in which it takes place. Amongst them are ambulatory, emergency, home health, inpatient and virtual encounters. An Encounter encompasses the lifecycle from pre-admission, the actual encounter (for ambulatory encounters), and admission, stay and discharge (for inpatient encounters). During the encounter the patient may move from practitioner to practitioner and location to location. 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Encounter.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| admitDate            | datetime  |          | true   |
| class                | nvarchar  | true     |        |
| dischargeDate        | datetime  | true     | true   |
| dischargeDisposition | nvarchar  |          |        |
| location             | nvarchar  | true     |        |
| status               | nvarchar  |          |        |

## Basic Demographics
*Dataset Shape **3*** - A representation of a combination of the [Person](https://www.hl7.org/fhir/person.html) and [Patient](https://www.hl7.org/fhir/patient.html) FHIR resources.

See the [Basic Demographics](#basic-demographics) section above for additional info.

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/PatientDemographic.cs)):

| Name              | Type      | Required | Is PHI |
| ----------------- | --------- | -------- | ------ |
| personId          | nvarchar  | true     | true   |
| addressPostalCode | nvarchar  | true     |        |
| addressState      | nvarchar  | true     |        |
| birthDate         | datetime  | true     |        |
| deceasedDateTime  | datetime  | true     |        |
| ethnicity         | nvarchar  | true     |        |
| gender            | nvarchar  | true     |        |
| deceasedBoolean   | bit       | true     |        |
| hispanicBoolean   | bit       | true     |        |
| marriedBoolean    | bit       | true     |        |
| language          | nvarchar  | true     |        |
| maritalStatus     | nvarchar  | true     |        |
| mrn               | nvarchar  | true     | true   |
| name              | nvarchar  | true     | true   |
| race              | nvarchar  | true     |        |
| religion          | nvarchar  | true     |        |

## Condition
*Dataset Shape **4*** - A representation of the [FHIR Condition Resource](https://www.hl7.org/fhir/condition.html).

The FHIR documention describes this as (emphasis added):
> This resource is used to record detailed information about a **condition, problem, diagnosis**, or other event, situation, issue, or clinical concept that has risen to a level of concern. The condition could be a point in time diagnosis in context of an encounter, it could be an item on the practitioner’s Problem List, or it could be a concern that doesn’t exist on the practitioner’s Problem List. Often times, a condition is about a clinician's assessment and assertion of a particular aspect of a patient's state of health. It can be used to record information about a disease/illness identified from application of clinical reasoning over the pathologic and pathophysiologic findings (diagnosis), or identification of health issues/situations that a practitioner considers harmful, potentially harmful and may be investigated and managed (problem), or other health issue/situation that may require ongoing monitoring and/or management (health issue/concern). 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Condition.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| abatementDateTime    | datetime  |          | true   |
| category             | nvarchar  | true     |        |
| code                 | nvarchar  | true     |        |
| coding               | nvarchar  | true     |        |
| onsetDateTime        | datetime  | true     | true   |
| recordedDate         | nvarchar  |          | true   |
| text                 | nvarchar  | true     |        |

## Procedure
*Dataset Shape **5*** - A representation of the [FHIR Procedure Resource](https://www.hl7.org/fhir/procedure.html).

The FHIR documention describes this as:
> This resource is used to record the details of current and historical procedures performed on or for a patient. A procedure is an activity that is performed on, with, or for a patient as part of the provision of care. Examples include surgical procedures, diagnostic procedures, endoscopic procedures, biopsies, counseling, physiotherapy, personal support services, adult day care services, non-emergency transportation, home modification, exercise, etc. Procedures may be performed by a healthcare professional, a service provider, a friend or relative or in some cases by the patient themselves. 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Procedure.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| category             | nvarchar  | true     |        |
| code                 | nvarchar  | true     |        |
| coding               | nvarchar  | true     |        |
| performedDateTime    | datetime  | true     | true   |
| text                 | nvarchar  | true     |        |

## Immunization
*Dataset Shape **6*** - A representation of the [FHIR Immunization Resource](https://www.hl7.org/fhir/immunization.html).

The FHIR documention describes this as:
> The Immunization resource is intended to cover the recording of current and historical administration of vaccines to patients across all healthcare disciplines in all care settings and all regions. This includes immunization of both humans and animals but does not include the administration of non-vaccine agents, even those that may have or claim to have immunological effects. While the terms "immunization" and "vaccination" are not clinically identical, for the purposes of the FHIR resources, the terms are used synonymously. 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Immunization.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| coding               | nvarchar  | true     |        |
| doseQuantity         | nvarchar  |          |        |
| doseUnit             | nvarchar  |          |        |
| occurenceDateTime    | datetime  | true     | true   |
| route                | nvarchar  |          |        |
| text                 | nvarchar  | true     |        |
| vaccineCode          | nvarchar  | true     |        |

## Allergy
*Dataset Shape **7*** - A representation of the [FHIR AllergyIntolerance Resource](https://www.hl7.org/fhir/allergyintolerance.html).

The FHIR documention describes this as:
> A record of a clinical assessment of an allergy or intolerance; a propensity, or a potential risk to an individual, to have an adverse reaction on future exposure to the specified substance, or class of substance. 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Allergy.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| category             | nvarchar  | true     |        |
| code                 | nvarchar  | true     |        |
| coding               | nvarchar  | true     |        |
| onsetDateTime        | datetime  | true     | true   |
| recordedDate         | nvarchar  |          | true   |
| text                 | nvarchar  | true     |        |

## MedicationRequest
*Dataset Shape **8*** - A representation of the [FHIR MedicationRequest Resource](https://www.hl7.org/fhir/medicationrequest.html).

The FHIR documention describes this as (emphasis added):
> This resource covers **all type of orders for medications for a patient**. This includes inpatient medication orders as well as community orders (whether filled by the prescriber or by a pharmacy). It also includes orders for over-the-counter medications (e.g. Aspirin), total parenteral nutrition and diet/ vitamin supplements. It may be used to support the order of medication-related devices. It is not intended for use in prescribing particular diets, or for ordering non-medication-related items (eyeglasses, supplies, etc.). In addition, the MedicationRequest may be used to report orders/request from external systems that have been reported for informational purposes and are not authoritative and are not expected to be acted upon (e.g. dispensed or administered). 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/MedicationRequest.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| amount               | numeric   |          |        |
| authoredOn           | datetime  | true     | true   |
| category             | nvarchar  | true     |        |
| code                 | nvarchar  | true     |        |
| coding               | nvarchar  | true     |        |
| form                 | nvarchar  |          |        |
| text                 | nvarchar  | true     |        |
| unit                 | nvarchar  |          |        |

## MedicationAdministration
*Dataset Shape **9*** - A representation of the [FHIR MedicationAdministration Resource](https://www.hl7.org/fhir/medicationadministration.html).

The FHIR documention describes this as:
> This resource covers the administration of all medications and vaccines. Please refer to the Immunization Resource/Profile for the treatment of vaccines. It will principally be used within care settings (including inpatient) to record the capture of medication administrations, including self-administrations of oral medications, injections, intra-venous adjustments, etc. It can also be used in outpatient settings to record allergy shots and other non-immunization administrations. In some cases, it might be used for home-health reporting, such as recording self-administered or even device-administered insulin. 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/MedicationAdministration.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| code                 | nvarchar  | true     |        |
| coding               | nvarchar  | true     |        |
| doseQuantity         | nvarchar  |          |        |
| doseUnit             | nvarchar  |          |        |
| effectiveDateTime    | datetime  | true     | true   |
| route                | nvarchar  |          |        |
| text                 | nvarchar  | true     |        |
