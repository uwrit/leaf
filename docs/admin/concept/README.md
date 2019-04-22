## The building blocks of Leaf: Concepts
* [Introduction](#introduction)
* [Creating Concepts using the Admin Panel](#creating-concepts-using-the-admin-panel)

## Introduction
Leaf is a SQL writing and execution engine. While it is designed to be fun and intuitive for users, ultimately Leaf's most important job is to reliably and flexibly construct SQL queries using a few simple but powerful configuration rules. 

Let's start with an example. We'll use an [OMOP](https://www.ohdsi.org/data-standardization/the-common-data-model/) v5 database for this example, though these steps can be applied to any particular data model. We'll focus on using the `person` table (via a `view`) and `visit_occurrence` table in our OMOP database.

The goals are:
1) Configure the Leaf SQL compiler.
2) Create Leaf SQL Sets for the `v_person` view and `visit_occurrence` table.
3) Create 3 Concepts using the SQL Sets.

## Configuring the SQL compiler
Every Leaf instance assumes that there is a single, consistent field that represents patient identifiers. In OMOP databases this is the `person_id` field, which can be found on nearly any table with patient data. Likewise, Leaf assumes that longitudinal tables in the database will have a consistent field representing encounter identifiers. In OMOP this is the `visit_occurrence_id` field.

Before starting, let's create two SQL `views` called `v_person` to make the `person` and `visit_occurrence` tables simpler to query. This example is specific to OMOP but the approach works for other models as well. Note that pointing Leaf at views is completely *optional* and demonstrated here for convenience and illustrative purposes.

Our `v_person` `view` is defined like this:

```sql
SELECT
    p.person_id
  , p.birth_datetime
  , gender           = c_gender.concept_code
  , race             = c_race.concept_name
  , ethnicity        = c_ethnicity.concept_name
  , location_state   = loc.state
FROM dbo.PERSON AS p
     LEFT JOIN dbo.concept AS c_gender ON p.gender_concept_id = c_gender.concept_id 
     LEFT JOIN dbo.concept AS c_race ON p.race_concept_id = c_race.concept_id 
     LEFT JOIN dbo.concept AS c_ethnicity ON p.ethnicity_concept_id = c_ethnicity.concept_id
     LEFT JOIN dbo.location AS loc ON p.location_id = loc.location_id
```

| person_id | birth_datetime | gender | race                       | ethnicity              | location_state
| --------- | -------------- | ------ | ---------------------------| ---------------------- | -------------- 
| A         | 1990-1-1       | F      | Black or African American  | Not Hispanic or Latino | NY
| B         | 1945-2-2       | M      | Asian or Pacific Islander  | Not Hispanic or Latino | OR

The `visit_occurrence` `view` is defined like this:

```sql
SELECT 
	person_id
  , visit_occurrence_id
  , o.visit_start_date
  , o.visit_end_date
  , o.care_site_id
  , visit_type_code = c_visit.concept_code
FROM dbo.visit_occurrence AS o 
	 LEFT JOIN dbo.concept AS c_visit 
		ON o.visit_concept_id = c_visit.concept_id
```

| person_id | visit_occurrence_id | visit_start_date | visit_end_date | care_site_id | visit_type_code |
| --------- | ------------------- | ---------------- | ---------------| ------------ | --------------- | 
| A         | 123                 | 2011-01-01       | 2011-01-01     | site1        | OP              | 
| A         | 456                 | 2015-05-28       | 2015-06-07     | site1        | IP              |
| B         | 789                 | 2014-09-01       | 2014-09-01     | site2        | ED              |

Pretty simple. After creating the views in the database, let's start by configuring Leaf's SQL compiler ([see details](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#compiler)), the configuration of which is stored in `/src/server/API/appsettings.json`:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/configure_json.gif"/></p>

Let's break it down:
* **Alias** acts as a indicator to Leaf to insert an alias in a `SQL` statement wherever this character(s) is found (more on that in a bit). We'll set this to `"@"` for simplicity and readability, and because it is commonly used in many Leaf configurations.
* **SetPerson** tells Leaf the name of the table that contains one row per patient, typically demographic information. In this example we'll use the `v_person` `view` we just created. Note that we prepend `"dbo."`, which stands for `"database object"` and is used in SQL Server to denote a `schema` and must precede the table/view name in `SQL` queries.
* **SetEncounter** is the name of the primary table for encounter information, with one row per encounter. We'll use the `visit_occurrence` table.
* **FieldPersonId** is the name of the `SQL` field that appears in all tables or views we'd like to query and represents unique identifiers for patients. The field `person_id` contains identifiers for patients and appears in all tables which link to a patient, so we'll choose that.
* **FieldEncounterId** is the name of the field that represents visit identifiers, so we'll use `visit_occurrence_id`.
* **FieldEncounterAdmitDate** and **FieldEncounterDischargeDate** are (perhaps unsurprisingly) the names of fields indicating encounter admission and discharge date times. `visit_start_date` and `visit_end_date` fit the bill, so we'll use those.

Great - we've now provided the most important information to help Leaf understand the basic structure of our clinical database. Note that these values are expected to be consistent and configured only once.

Next, we'll move on to creating Concepts, the building blocks of Leaf queries.

## Creating a SQL Set
Let's create a Leaf `SQL Set` representing the new `view`, `v_person`. Open up the Leaf client in your web browser.

> This step assumes you've already followed the [Leaf deployment guide](https://github.com/uwrit/leaf/tree/master/docs/deploy) and set up appropriate web, application, and database servers. If you haven't, start there first.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/login.gif"/></p>

Select `Research` -> `No` -> `De-identified`.

Click `Admin` on the left sidebar.

> If you don't see the `Admin` tab, make sure you have configured your [admin group correctly](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#admin).

Click `Start by creating a Concept SQL Set`. `SQL Sets` are the SQL tables, views, or subqueries that are the foundation of Concepts and provide their `FROM` clauses.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/sqlsets.gif"/></p>

You should see a single white box near the top. Under `SQL FROM`, enter `dbo.v_person`.

Next, create another `SQL Set` for `dbo.v_visit_occurrence`. Click `+ Create New SQL Set` and fill in `dbo.visit_occurrence_id` under `SQL FROM`. Also, check the `Has Encounters` box. This indicates that Leaf should expect to find the `EncounterId` field and a date field on this table.

Under `Date Field`, fill in `@.`, which you'll recall is the first date field on the `v_visit_occurrence` `view`. Don't forget to prepend the alias placeholder `@.` before the field name. The `Date Field` we've added will be used later if users choose to filter a Concept using this `SQL Set` by dates (e.g., the past 6 months).

Click `Save` at the top. Now we are ready to make a few Concepts that use our `Patient` and `Encounter` tables. Click `Back to Concept Editor` in the upper-right, then `+ Create New Concept` at the top.
