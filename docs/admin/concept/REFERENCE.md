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

For example, imagine we have a `dbo.diagnosis` table that looks like this:

| person_id | encounter_id | diag_date   | coding_sys | diag_code | source    | type      |
| --------- | ------------ | ----------- | ---------- | --------- | --------- | --------- |
| A         | 123          | 2009-01-01  | ICD10      | E11.2     | billing   | primary   |
| B         | 456          | 2005-08-10  | ICD10      | T02.5     | radiology | secondary |
| B         | 789          | 2011-06-22  | ICD10      | A15.5     | charges   | primary   |

### The Problem
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown1.png"/></p>

We would probably create a Concept tree with a root `Diagnoses` Concept using the ICD10 hierarchy to allow users to run queries to find patients with certain diagnosis codes, such as type 2 diabetes mellitus:

But what if users wanted to specify that the diagnosis must come from a specific source, such as `billing` or `radiology`?

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown2.gif"/></p>

One approach to solve this would be to create child Concepts under **every** diagnosis Concept, with each child representing a diagnosis from a particular source:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown3.png"/></p>

This works to a certain extent, though with every additional diagnosis source, we've doubled the number of diagnosis Concepts. Given that there are roughly 68,000 ICD-10 codes as of this writing (not including their parent Concepts which represent ranges of codes), adding child Concepts for just the three example sources above, `billing`, `radiology`, and `charges` will add over 200,000 Concepts to our tree. Just as importantly, this solution may not necessarily be intuitive for users.

What if we then wanted to also allow users to specify whether the diagnosis was `primary` or `secondary`?

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown4.png"/></p>

We could simply add these as additional child Concepts, though users wouldn't be able to find patients who had this as the `primary` diagnosis **and** from `billing`.

Alternatively, we could create `primary` and `secondary` child Concepts under **every** `billing`, `radiology`, and `charges` Concept:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown5.png"/></p>

Yikes. This creates a Cartesian product of all diagnosis source and primary/secondary types **for every diagnosis Concept**. This is likely to be both confusing for users and wasteful in visual space (in the UI) and database storage.

### Dropdowns to the Rescue

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown6.gif"/></p>

Dropdowns allow users to make the Concept logic more granular if they choose to, and do so in a visually intuitive way.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown7.gif"/></p>

To create a dropdown:

1) Go to the `Admin` tab and click on any Concept. Under `SQL`, click `Table, View, or Subquery` -> `Manage SQL Sets`.

2) Under the `SQL Set` you'd like to add a dropdown to, click `+Add New Dropdown` in the lower-left.

3) Under `Default Text`, add the text that should be shown if the user hasn't selected a dropdown option.

4) For each option you'd like to add, click `+Add Dropdown Option` and enter the `Text` that should be shown, as well as the `SQL WHERE` clause that should be appended to the Concept SQL if the user selects the option.

5) Click `Save` at the top.

Because dropdowns are tied to `SQL Sets`, every Concept that uses that `SQL Set` is able to enable the dropdown as well, allowing dropdowns to be easily reused across many Concepts.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown8.gif"/></p>

To enable a dropdown for a Concept:

1) After creating the dropdowns, in the `Admin` screen click the Concept you'd like to enable dropdowns for.

2) Under `Configuration`, make sure `Allow Dropdowns` is set to `true`.

3) Under `Dropdowns`, click each dropdown you'd like to enable. Enabled dropdowns will turn green and say "enabled!".

> If you don't see any dropdowns available, under `SQL` make sure the Concept is using the same `SQL Set` as the dropdowns.

4) Click `Save` at the top.

Users will now see the dropdown options when they drag over the Concept.

## Restricting Access
Certain Concepts may represent sensitive data which you need to restrict access to, such as financial data.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_constraint.gif"/></p>

To constrain access to certain users or groups:

1) In the `Admin` screen, create a new Concept or click an existing Concept to edit.

2) Scroll down to `Access Restrictions` and click `+Add New Restriction`.

3) Select whether you'd like to give a specific `User` access or a `Group`.

4) Enter the `User` or `Group` name, making sure to include the Leaf [Issuer](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#issuer) after the user name.

Note that:

* **All child and descendent Concepts beneath the restricted Concept inherit the restriction**.
* **If there are multiple restrictions, users need to meet only *one* of them in order to access the Concept**.

## Universal IDs
## Creating Concepts by SQL Scripts
