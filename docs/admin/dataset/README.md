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

After users identify a Cohort in (1), they can next do (2). In Leaf, extracted data for a cohort are called `Datasets`, which is short-hand for `Patient List Datasets`. This refers to the row-level patient data you can see on the `Patient List` screen.

Each `Dataset` is based on templates, or denormalized tabular representations of [FHIR resources](https://www.hl7.org/fhir/resourcelist.html). In order to add `Datasets`, administrators can define SQL queries whose column names and types match a given template. 

**Note that we also have an existing issue to add dynamic datasets which would allow admins to define completely custom datasets with arbitrary columns https://github.com/uwrit/leaf/issues/95. If you think these would be helpful to you please comment and add your thoughts.**

### Basic Demographics
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/dataset_intro.gif"/></p>

The core `Dataset` Leaf uses is `Basic Demographics`. The output of this query is used to both populate the initial `Patient List` screen, as well as populate the bar charts on the `Visualize` screen.

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
- **The Patient Identifier column must be called *personId*** - While Leaf Concepts are flexible regarding the [column name for patient identifiers](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#fieldpersonid), `Datasets` are more restrictive and require a predictable, specific column name. This ensures alignment of Leaf `Datasets` when multiple Leaf instances are federated, among other reasons.
- **It's okay if you don't have data for every column** - Though every column must be returned in the SQL statement, it's fine to hard-code it as 'Unknown', etc. For example, `religion = 'Unknown'`.
- **The `isDeceased`, `isHispanic`, and `isMarried` bit/boolean columns are used in the bar charts on the `Visualize` screen** - These are needed because Leaf does not enforce specific values for the `ethnicity` or `maritalStatus` columns (so you have flexiblity in showing your data as it is), but in return you need to define these true/false columns yourself. For example, `hispanicBoolean = CAST(CASE ethnicity WHEN 'Hispanic or Latino' THEN 1 ELSE 0 END AS BIT)`.
- **Values in `gender` must be `F`, `Female`, `M`, or `Male`** - This allows them to be predictably aggregated in bar charts (case insensitive).

### Defining the Basic Demographics Query
Currently the Basic Demographics query (and other `Datasets`) must be added via SQL directly to the database, though we intend to create functionality in the `Admin` screen to make this easier in the future.

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

## Dataset Templates Reference
As mentioned in the [Introduction](#introduction), `Datasets` are denormalized, tabular representations of [FHIR resources](https://www.hl7.org/fhir/resourcelist.html).

> SQL Columns of type `numeric` listed below can be `INT`, `FLOAT`, `MONEY`, `NUMERIC`, `REAL`, `SMALLINT`, `SMALLMONEY`, or `DECIMAL`.

## Observation
*Dataset Shape **1***

A representation of the [FHIR Observation Resource](https://www.hl7.org/fhir/observation.html).

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
| category           | nvarchar  | true     | false  |
| code               | nvarchar  | true     | false  |
| effectiveDate      | datetime  | true     | true   |
| referenceRangeLow  | datetime  | false    | false  |
| referenceRangeHigh | nvarchar  | false    | false  |
| specimenType       | nvarchar  | false    | false  |
| valueString        | nvarchar  | true     | false  |
| valueQuantity      | numeric   | false    | false  |
| valueUnit          | nvarchar  | false    | false  |

## Encounter
*Dataset Shape **2***

A representation of the [FHIR Encounter Resource](https://www.hl7.org/fhir/encounter.html).

The FHIR documention describes this as:
> A patient encounter is characterized by the setting in which it takes place. Amongst them are ambulatory, emergency, home health, inpatient and virtual encounters. An Encounter encompasses the lifecycle from pre-admission, the actual encounter (for ambulatory encounters), and admission, stay and discharge (for inpatient encounters). During the encounter the patient may move from practitioner to practitioner and location to location. 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Encounter.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| admitDate            | datetime  | false    | true   |
| class                | nvarchar  | true     | false  |
| dischargeDate        | datetime  | true     | true   |
| dischargeDisposition | nvarchar  | false    | false  |
| location             | nvarchar  | true     | false  |
| status               | nvarchar  | false    | false  |

## Basic Demographics
*Dataset Shape **3***

A representation of a combination of the [Person](https://www.hl7.org/fhir/person.html) and [Patient](https://www.hl7.org/fhir/patient.html) FHIR resources.

See the [Basic Demographics](#basic-demographics) section above for additional info.

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/PatientDemographic.cs)):

| Name              | Type      | Required | Is PHI |
| ----------------- | --------- | -------- | ------ |
| personId          | nvarchar  | true     | true   |
| addressPostalCode | nvarchar  | true     | false  |
| addressState      | nvarchar  | true     | false  |
| birthDate         | datetime  | true     | false  |
| deceasedDateTime  | datetime  | true     | false  |
| ethnicity         | nvarchar  | true     | false  |
| gender            | nvarchar  | true     | false  |
| deceasedBoolean   | bit       | true     | false  |
| hispanicBoolean   | bit       | true     | false  |
| marriedBoolean    | bit       | true     | false  |
| language          | nvarchar  | true     | false  |
| maritalStatus     | nvarchar  | true     | false  |
| mrn               | nvarchar  | true     | true   |
| name              | nvarchar  | true     | true   |
| race              | nvarchar  | true     | false  |
| religion          | nvarchar  | true     | false  |

## Condition
*Dataset Shape **4***

A representation of the [FHIR Condition Resource](https://www.hl7.org/fhir/condition.html).

The FHIR documention describes this as (emphasis added):
> This resource is used to record detailed information about a **condition, problem, diagnosis**, or other event, situation, issue, or clinical concept that has risen to a level of concern. The condition could be a point in time diagnosis in context of an encounter, it could be an item on the practitioner’s Problem List, or it could be a concern that doesn’t exist on the practitioner’s Problem List. Often times, a condition is about a clinician's assessment and assertion of a particular aspect of a patient's state of health. It can be used to record information about a disease/illness identified from application of clinical reasoning over the pathologic and pathophysiologic findings (diagnosis), or identification of health issues/situations that a practitioner considers harmful, potentially harmful and may be investigated and managed (problem), or other health issue/situation that may require ongoing monitoring and/or management (health issue/concern). 

SQL Columns ([source](https://github.com/uwrit/leaf/blob/master/src/server/Model/Cohort/Condition.cs)):

| Name                 | Type      | Required | Is PHI |
| -----------------    | --------- | -------- | ------ |
| personId             | nvarchar  | true     | true   |
| encounterId          | nvarchar  | true     | true   |
| abatementDateTime    | datetime  | false    | true   |
| category             | nvarchar  | true     | false  |
| code                 | nvarchar  | true     | false  |
| coding               | nvarchar  | true     | false  |
| onsetDateTime        | datetime  | true     | true   |
| recordedDate         | nvarchar  | false    | true   |
| text                 | nvarchar  | true     | false  |