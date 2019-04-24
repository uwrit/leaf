## Concept Reference
- [Name, Subtext, and Full Text](#name-subtext-and-full-text)
- [Tooltips](#tooltips)
- [Patient Count](#patient-count)
- [Numeric Filters](#numeric-filters)
- [Adding Dropdowns](#adding-dropdowns)
- [Restricting Access](#restricting-access)
- [Universal IDs](#universal-ids)
- [Creating Concepts by SQL Scripts](#creating-concepts-by-sql-scripts)

## Name, Subtext, and Full Text
Textual descriptions of Concepts are critical to making information about them clear to users. Leaf Concepts have three primary fields for describing information about them:
(*Concept fields referenced here are stored in the `app.Concept` database table unless otherwise noted*)

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_name.png"/></p>

- `Name` - The primary text shown for the Concept within the tree. Try to keep this brief, leveraging parent Concepts above it to provide context and provenance where possible. This is stored in the database as `UiDisplayName`. 
- `Subtext` - The smaller, lighter text shown to the right of the `Name`. This is optional, and we have found this works well for adding information such as how far back data in the Concept go. This is stored in the database as `UiDisplaySubtext`.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_fulltext.png"/></p>

- `Full Text` - The text shown when a user drags the Concept over to create a query. We suggest making this a bit more verbose than `Name`, and approximating a sentence. This is stored in the database as `UiDisplayText`.

## Tooltips
Tooltips are a bit of a misnomer, as they are actually shown when the user clicks `Learn More` while hovering over a Concept, rather than just by hovering alone. 

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_tooltip.png"/></p>

`Tooltip` text can be used to provide detailed information to users about the data the Concept represents, but may be too long to put in the `Name` or `Subtext`. The text can be seen in the above example in the `Sources: Epic Clarity...` information. This is stored in the database as `UiDisplayTooltip`.

## Patient Count
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_patientcount.png"/></p>

The `Patient Count` field shows a small green person indicating the number of unique patients the user would *expect* to find if she were to run a query with this Concept only and with no date restrictions, etc. 

The `stored procedure` to automatically loop through the `app.Concept` table and calculate this for each Concept is here https://github.com/uwrit/leaf/blob/master/src/db/obj/app.sp_CalculateConceptPatientCount.StoredProcedure.sql, though please note that this will likely be scripted into an API or CLI-based procedure in the future.

This is stored in the database as `UiDisplayPatientCount`.

## Numeric Filters
Use numeric filters to allow users to query based on a numeric value in your database.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_numeric1.gif"/></p>

1) Create a new Concept and set `Configuration` -> `Is Numeric` to `true`.

2) Set the `Name` and `Full Text` fields in `General Display` as you normally would.

3) Fill in the `Numeric default text`, which is shown *after* the `Name` if the user has not filtered the Concept by any numeric value.

4) Optionally, set the `Units of measurement`, such as `years`, `kg`, etc.

5) Under `SQL`, set the `Numeric Field or expression` to the numeric column or expression that you'd like to query.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_numeric2.gif"/></p>

## Adding Dropdowns
Dropdowns (also known as Concept *specializations*) allow users to optionally specify additional logic about a Concept to include in a query.

For example, imagine we have a `Diagnosis` table that looks like this:

| person_id | coding_sys | diag_code | source    | type      |
| --------- | ---------- | --------- | --------- | --------- |
| A         | ICD10      | E11.2     | billing   | primary   |
| B         | ICD10      | T02.5     | radiology | secondary |
| C         | ICD10      | A15.5     | charges   | primary   |

Naturally, we would probably create a Concept tree with a root `Diagnosis` Concept using the ICD10 hierarchy to allow users to run queries to find patients with certain diagnosis codes, such as type 2 diabetes mellitus:

PICTURE

What if users wanted to specify that the diagnosis must come from a specific source, such as`Billing` or `Radiology`?

We could of course create child Concepts under every diagnosis code Concept, with each child representing patients who had the diagnosis from that source:

PICTURE

This works to a certain extent, though with every additional diagnosis source, we've double the number of diagnosis Concepts, and this solution may or may not be intuitive for users.

What if we then wanted to also allow users to specify whether the diagnosis was `primary` or `secondary`?


## Restricting Access
## Universal IDs
## Creating Concepts by SQL Scripts
