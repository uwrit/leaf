## The building blocks of Leaf: Concepts
* [Introduction](#introduction)
* [Creating Concepts using the Admin Panel](#creating-concepts-using-the-admin-panel)

## Introduction
Leaf is a `SQL` writing and execution engine. While it is designed to be fun and intuitive for users, ultimately Leaf's most important job is to reliably and flexibly construct `SQL` queries. 

Leaf works using a few simple but powerful configuration rules. Let's start with an example. Imagine we have a clinical database we'd like to configure Leaf to query. The database has only two tables, `Patient` and `Encounter`. 

`Patient` looks like this:

| PatientId | BirthDate | Gender |
| --------- | --------- | ------ |
| A         | 1990-1-1  | F      |
| B         | 1945-2-2  | M      |

And `Encounter` looks like this: 

| PatientId | EncounterId | VisitType  | AdmitDate  | DischargeDate |
| --------- | ----------- | ---------- | ---------- | ------------- |
| A         | 123         | Outpatient | 1995-6-1   | 1995-6-1      |
| A         | 456         | Inpatient  | 2001-7-8   | 2001-7-11     |
| B         | 789         | Outpatient | 1997-12-10 | 1997-12-10    |

Pretty simple. Let's start by configuring Leaf's SQL compiler ([see details](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#compiler)), the configuration of which is stored as a `JSON` object:

```javascript
"Compiler": {
  "Alias": "@",
  "SetPerson": "dbo.Patient",
  "SetEncounter": "dbo.Encounter",
  "FieldPersonId": "PatientId",
  "FieldEncounterId": "EncounterId",
  "FieldEncounterAdmitDate": "AdmitDate",
  "FieldEncounterDischargeDate": "DischargeDate"
}
```

Let's break it down:
* `Alias` acts as a indicator to Leaf to insert an alias in a `SQL` statement wherever this character(s) is found (more on that in a bit). We'll set this to `"@"` for simplicity and readability, and because it is commonly used in many Leaf configurations.
* `SetPerson` tells Leaf the name of the table that contains one row per patient, typically demographic information. In this example we'll use the `Patient` table. Note that we prepend `"dbo."`, which stands for `"database object"` and is used in SQL Server to denote a `schema` and must precede the table name in `SQL` queries.
* `SetEncounter` is the name of the primary table for encounter information, with one row per encounter. We'll use our `Encounter` table.
* `FieldPersonId` is the name of the `SQL` field that appears in all tables or views we'd like to query and represents unique identifiers for patients. The field `PatientId` appears in both tables and contains identifiers for patients, so we'll choose that.
* `FieldEncounterId` is the name of the field that represents visit identifiers, so we'll use `EncounterId`.
* `FieldEncounterAdmitDate` and `FieldEncounterDischargeDate` are (perhaps unsurprisingly) the names of fields indicating encounter admission and discharge date times. `AdmitDate` and `DischargeDate` seem to fit the bill, so we'll use those.

Great - we've now provided the most important information to help Leaf understand the basic structure of our clinical database. Note that these values are expected to be consistent and configured only once.

Next, we'll move on to creating Concepts, the building blocks of Leaf queries.

## Creating Concepts using the Admin Panel
Let's create our first Concept. Open up the Leaf client in your web browser. We'll continue with the two example tables earlier, but feel free to use real table or view names in your clinical database.

> This step assumes you've already followed the [Leaf deployment guide](https://github.com/uwrit/leaf/tree/master/docs/deploy) and set up appropriate web, application, and database servers. If you haven't, start there first.

Select `Research` -> `No` -> `De-identified`. When you first log in, your screen should look something like this:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/no_concepts.png"/></p>

Click `Admin` on the left sidebar.

> If you don't see the `Admin` tab, make sure you have configured your [admin group correctly](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#admin).

Click `Start by creating a Concept SQL Set`. `SQL Sets` are the SQL tables, views, or subqueries that are the foundation of Concepts. In this case, we only have two tables, `Patient` and `Encounter`. Let's add both as `SQL Sets`.

You should see a single white box near the top. Under `SQL FROM`, enter `"dbo.Patient"`. There are a few other configuration options you may see, but don't worry about those yet.

Next we need to create another `SQL Set` for `Encounter`, so click `+ Create New SQL Set` and fill in `"dbo.Encounter"` under `SQL FROM`. Also, check the `Has Encounters` box. This indicates that Leaf should expect to find the `EncounterId` field we configured in the earlier on this table, as well as a date field.

Under `Date Field`, fill in `"@.AdmitDate"`, which you'll recall is the first date field on the `Encounter` table. Don't forget to prepend the alias placeholder `"@."` before the field name. The `Date Field` we've added will be used later if users choose to filter a Concept using this `SQL Set` by dates (e.g., the past 6 months).

Your screen should look like this:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/unsaved_sql_sets.png"/></p>

Click `Save` at the top. Now we are ready to make a few Concepts that use our `Patient` and `Encounter` tables. Click `Back to Concept Editor` in the upper-right, then `+ Create New Concept` at the top.
