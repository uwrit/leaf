## The Building Blocks of Leaf: Concepts
- [Introduction](#introduction)
- [Configuring the SQL compiler](#configuring-the-sql-compiler)
- [Creating SQL Sets](#creating-sql-sets)
- [Creating Concepts](#creating-concepts)
    - [Demographics](#demographics)
    - [Road test](#road-test)
    - [Encounters](#encounters)
- [Final Thoughts](#final-thoughts)


## Introduction
Leaf is a SQL writing and execution engine. While it is designed to be fun and intuitive for users, ultimately Leaf's most important job is to reliably and flexibly construct SQL queries using a few simple but powerful configuration rules. 

Let's start with an example. We'll use an [OMOP](https://www.ohdsi.org/data-standardization/the-common-data-model/) v5 database for this example, though these steps can be applied to any particular data model. We'll focus on using the `person` and `visit_occurrence` tables via views in our OMOP database.

The goals are:
1) Configure the Leaf SQL compiler.
2) Create Leaf SQL Sets for the `v_person` and `v_visit_occurrence` views.
3) Create basic demographics and encounter Concepts which query our clinical database.

## Configuring the SQL compiler
Every Leaf instance assumes that there is a single, consistent field that represents patient identifiers. In OMOP databases this is the `person_id` field, which can be found on nearly any table with patient data. Likewise, Leaf assumes that longitudinal tables in the database will have a consistent field representing encounter identifiers. In OMOP this is the `visit_occurrence_id` field.

Before starting, let's create two SQL views called `v_person` and `v_visit_occurrence` to make the `person` and `visit_occurrence` tables simpler to query. This example is specific to OMOP but the approach works for other models as well. Note that pointing Leaf at views is completely *optional* and demonstrated here for convenience and illustrative purposes.

Our `v_person` view is defined like this:

```sql
SELECT
    p.person_id
  , p.birth_datetime
  , gender           = c_gender.concept_code
  , race             = c_race.concept_name
  , ethnicity        = c_ethnicity.concept_name
  , location_state   = loc.state
FROM dbo.person AS p
     LEFT JOIN dbo.concept AS c_gender ON p.gender_concept_id = c_gender.concept_id 
     LEFT JOIN dbo.concept AS c_race ON p.race_concept_id = c_race.concept_id 
     LEFT JOIN dbo.concept AS c_ethnicity ON p.ethnicity_concept_id = c_ethnicity.concept_id
     LEFT JOIN dbo.location AS loc ON p.location_id = loc.location_id
```

| person_id | birth_datetime | gender | race                       | ethnicity              | location_state
| --------- | -------------- | ------ | ---------------------------| ---------------------- | -------------- 
| A         | 1990-1-1       | F      | Black or African American  | Not Hispanic or Latino | NY
| B         | 1945-2-2       | M      | Asian or Pacific Islander  | Not Hispanic or Latino | OR

The `v_visit_occurrence` view is defined like this:

```sql
SELECT 
    person_id
  , visit_occurrence_id
  , o.visit_start_date
  , o.visit_end_date
  , o.care_site_id
  , visit_type_code = c_visit.concept_code
FROM dbo.visit_occurrence AS o 
     LEFT JOIN dbo.concept AS c_visit ON o.visit_concept_id = c_visit.concept_id
```

| person_id | visit_occurrence_id | visit_start_date | visit_end_date | care_site_id | visit_type_code |
| --------- | ------------------- | ---------------- | ---------------| ------------ | --------------- | 
| A         | 123                 | 2011-01-01       | 2011-01-01     | site1        | OP              | 
| A         | 456                 | 2015-05-28       | 2015-06-07     | site1        | IP              |
| B         | 789                 | 2014-09-01       | 2014-09-01     | site2        | ED              |

Pretty simple. After creating the views in the database, let's start by configuring Leaf's [SQL compiler configuration](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#compiler)), which is stored in `/src/server/API/appsettings.json`:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/configure_json.gif"/></p>

Let's break it down:
* **Alias** acts as a indicator to Leaf to insert an alias in a `SQL` statement wherever this character(s) is found (more on that in a bit). We'll set this to `"@"` for simplicity and readability, and because it is commonly used in many Leaf configurations.
* **SetPerson** tells Leaf the name of the table that contains one row per patient, typically demographic information. In this example we'll use the `v_person` view we just created. Note that we prepend `"dbo."`, which stands for `"database object"` and is used in SQL Server to denote a `schema` and must precede the table/view name in `SQL` queries.
* **SetEncounter** is the name of the primary table for encounter information, with one row per encounter. We'll use the `v_visit_occurrence` view.
* **FieldPersonId** is the name of the SQL field that appears in all tables or views we'd like to query and represents unique identifiers for patients. The field `person_id` contains identifiers for patients and appears in all tables which link to a patient, so we'll choose that.
* **FieldEncounterId** is the name of the field that represents visit identifiers, so we'll use `visit_occurrence_id`.
* **FieldEncounterAdmitDate** and **FieldEncounterDischargeDate** are (perhaps unsurprisingly) the names of fields indicating encounter admission and discharge date times. `visit_start_date` and `visit_end_date` fit the bill, so we'll use those.

Great - we've now provided the most important information to help Leaf understand the basic structure of our clinical database. Note that these values are expected to be consistent and configured only once.

Next, we'll move on to creating Concepts, the building blocks of Leaf queries.

## Creating SQL Sets
We want to allow users to query Concepts using our two new views, `v_person` and `v_visit_occurrence`. To do so, let's create a Leaf `SQL Set` for each. Open up the Leaf client in your web browser.

> This step assumes you've already followed the [Leaf deployment guide](https://github.com/uwrit/leaf/tree/master/docs/deploy) and set up appropriate web, application, and database servers. If you haven't, start there first.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/login.gif"/></p>

1) Select `Research` -> `No` -> `De-identified`.

2) Click `Admin` on the left sidebar.

> If you don't see the `Admin` tab, make sure you have configured your [admin group correctly](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#admin).

3) Click `Start by creating a Concept SQL Set`. `SQL Sets` are the SQL tables, views, or subqueries that are the foundation of Concepts and provide their `FROM` clauses.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/sqlsets.gif"/></p>

4) You should see a single white box near the top. Under `SQL FROM`, enter `dbo.v_person`.

5) Next, create another `SQL Set`. Click `+ Create New SQL Set` and fill in `dbo.v_visit_occurrence` under `SQL FROM`. Also, check the `Has Encounters` box. This indicates that Leaf should expect to find the `EncounterId` field and a date field on this table.

6) Under `Date Field`, fill in `@.visit_start_date`, which you'll recall is the first date field on the `v_visit_occurrence` view. Don't forget to prepend the alias placeholder `@.` before the field name.

7) Click `Save` at the top. Now we are ready to make a few Concepts that use our `v_person` and `v_visit_occurrence` views. 

8) Click `Back to Concept Editor` in the upper-right.

## Creating Concepts
We've successfully created `SQL Sets` for our views, so we can now create Concepts that users can interact with.

Our next goal will be to create a basic Concept tree with the following structure:

```
Demographics
├── Gender
│   ├── Female
│   ├── Male
Encounters
├── Inpatient
├── Outpatient
```

Click `Back to Concept Editor`, then `+Create New Concept`.

### Demographics
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_demographics.gif"/></p>

1) Under `Name`, fill in `"Demographics"`. This will be the text that users see in the Concept tree.

2) Go down to `Full Text` and enter `Have demographics`. Users will see this text if dragged over to create a query. Why is `Full Text` different than `Name`? The intent here is to make the query as descriptive as possible in something approximating an English sentence.

3) Lastly, under the `SQL` section make sure the `Table, View, or Subquery` box shows `dbo.v_person` and the  `WHERE Clause` field is empty. Click `Save` at the top.

As you may have noticed, this Concept is intended to simply serve as a hierachical container for Concepts under it related to Demographics. By itself it will likely not be very useful to users, and if they were to drag it over the query would be something simple like `SELECT person_id FROM dbo.v_person`, in other words all patients in the table.

Next let's create the `Gender` Concept, which will appear under `Demographics`. Click `+Create New Concept` at the top.

### Gender
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_gender.gif"/></p>

1) Under `Name`, fill in `Gender`, and under `Full Text`, fill in `Identify with a gender`. 

2) We want this Concept to appear beneath `Demographics`, so drag the new Concept *into* it in order set `Demographics` as the parent Concept.

3) Finally, as this Concept represents data about patient gender, users presumably would expect that patients without this data should be excluded. Under `SQL` -> `WHERE Clause` enter `@.gender IS NOT NULL`.

Click `Save`. Repeat the process for the final two demographic Concepts, `Female` and `Male`, with the following data:

- Female
    - General Display
        - Name: `Female`
        - Full text: `Identify as female`
    - SQL
        - Table, View, or Subquery: `dbo.v_person`
        - WHERE Clause: `@.gender = 'F'`
- Male
    - General Display
        - Name: `Male`
        - Full text: `Identify as male`
    - SQL
        - Table, View, or Subquery: `dbo.v_person`
        - WHERE Clause: `@.gender = 'M'`

> In reality people don't necessarily identify as female or male, and clinical databases will often reflect this. Female and male here are used simply for demonstrative purposes.

### Road test
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_firstquery.gif"/></p>

Before proceeding to create our `Encounters` Concepts, let's take a moment to confirm our `Demographics` Concepts are working as expected by running a quick query to see how many female patients are in our database.

1) Click the `Find Patients` tab in the upper-left and drag `Female` over to the first panel.

2) Click `Run Query`. If you see a count of patients (assuming your database has female patients), great! You can even click `(i)` -> `show detail` -> `SQL` to see the query Leaf created using the new Concept. Success!

> If your query didn't work (you'll get a modal window notifying you there was an error), check the Leaf logs to see if there were any syntax or other errors in the query

### Encounters
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_encounters.gif"/></p>

Now that you're hopefully getting the hang of creating Concepts, let's finish by creating `Encounter` Concepts so users can query information by encounter types.

Remember that the structure should look like this:
```
Encounters
├── Inpatient
├── Outpatient
```

The field-level information for each Concept is (making sure to nest `Inpatient` and `Outpatient` under `Encounters`):

- Encounters
    - General Display
        - Name: `Encounters`
        - Full text: `Had an encounter`
    - SQL
        - Table, View, or Subquery: `dbo.v_visit_occurrence`
        - WHERE Clause: ``
- Inpatient
    - General Display
        - Name: `Inpatient`
        - Full text: `Were admitted as an inpatient`
    - SQL
        - Table, View, or Subquery: `dbo.v_visit_occurrence`
        - WHERE Clause: `@.visit_type_code = 'IP'`
- Outpatient
    - General Display
        - Name: `Outpatient`
        - Full text: `Had an outpatient visit`
    - SQL
        - Table, View, or Subquery: `dbo.v_visit_occurrence`
        - WHERE Clause: `@.visit_type_code = 'OP'`

And that's it! 

## Final thoughts
If you were able to successfully make the Concepts in this tutorial, congratulations! Hopefully this was helpful and intuitive enough for you to get started making your clinical database accessible and intuitive for your users as well. 

Concepts can be extremely flexible and we've only scratched the surface of their functionality. If you'd like to learn more, head over to the [Concept Creation Details](https://github.com/uwrit/leaf/blob/master/docs/admin/concept-advanced/README.md) section.

As you were creating Concepts for your database, you may have found yourself thinking that it requires a change in perspective in thinking about how you as a developer would query a clinical database versus how best to represent Concepts to users. 

We've found that this is just as much an art as a science, and it's ultimately an iterative process, so don't worry about getting it perfect the first time.
