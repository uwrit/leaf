# Datasets
- [Introduction](#introduction)
- [Basic Demographics](#basic-demographics)
- [Adding Datasets](#adding-datasets)

## Introduction
At a high level, Leaf aims to do two things:

1) Identify cohorts of patients (using [Concepts](https://github.com/uwrit/leaf/blob/master/docs/admin/concept/README.md)).

2) Extract data for those patients.

Let's talk about #2. In Leaf, `Datasets` is a short-hand for `Patient List Datasets`, which refers to the row-level patient data you can see on the `Patient List` screen.

Each `Dataset` is based on templates, or denormalized tabular representations of [FHIR resources](https://www.hl7.org/fhir/resourcelist.html).

This means that admins need to define SQL queries whose column names and types match the template. 

**Note that we also have an existing issue to add dynamic `Datasets` which would allow admins to define completely custom datasets with arbitrary columns https://github.com/uwrit/leaf/issues/95. If you think these would be helpful to you please comment and add your thoughts.**

### Basic Demographics
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/dataset_intro.gif"/></p>

The core `Dataset` Leaf uses is `Basic Demographics`. The output of this query is used to both populate the initial `Patient List` screen, as well as populate the bar charts on the `Visualize` screen.

The fields in `Basic Demographics` represent a denormalized combination of the FHIR [Person](https://www.hl7.org/fhir/person.html) and [Patient](https://www.hl7.org/fhir/patient.html) resources.

The expected columns are:

| Name              | SqlType   | 
| ----------------- | --------- |
| person_id         | nvarchar  |
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
- All columns are **required**. Leaf will automatically date-shift, calculate ages, and remove the HIPAA identified columns (`mrn` and `name`) depending on if the user is in `Identified` or `De-identified` mode.
- If you don't have data for a given column, it is fine to simply define it as "Unknown", etc. For example `religion = 'Unknown'`.
- The `isDeceased`, `isHispanic`, and `isMarried` bit/boolean columns are used in the bar charts on the `Visualize` screen. These are needed because Leaf does not enforce specific values for the `ethnicity` or `maritalStatus` columns (so you have flexiblity in showing your data as it is), but in return you need to define these true/false columns yourself. For example, `hispanicBoolean = CAST(CASE ethnicity WHEN 'Hispanic or Latino' THEN 1 ELSE 0 END AS BIT)`.
- Values in `gender` must be `F`, `Female`, `M`, or `Male` in order to be aggregated in bar charts (case insensitive).

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
INSERT [app].[DemographicQuery] ([Lock], [SqlStatement], [Shape], [LastChanged], [ChangedBy]) 
VALUES 
(   'X'
  , 'SELECT 
      personId = CAST(p.person_id AS NVARCHAR)
    , addressPostalCode = l.zip
    , addressState = p.location_state
    , birthDate = p.birth_datetime
    , deceasedDateTime = p.death_date
    , ethnicity = p.ethnicity
    , gender = CASE WHEN p.gender = ''F'' THEN ''female'' WHEN p.gender = ''M'' THEN ''male'' ELSE ''other'' END
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
  , [Shape] = 3
  , GETDATE()
  , 'my_user_name'
)
```

Note that the `Shape` field in Leaf happens to be value `3`, so it needs to be hard-coded here.
