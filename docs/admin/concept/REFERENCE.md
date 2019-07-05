# Concept Reference
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

An example `stored procedure` to automatically loop through the `app.Concept` table and calculate this for each Concept is here https://github.com/uwrit/leaf/blob/master/src/db/obj/app.sp_CalculatePatientCounts.StoredProcedure.sql, though please note that this will likely be scripted into an API or CLI-based procedure in the future.

This can be used by:

```sql
EXEC app.sp_CalculatePatientCounts
    @PersonIdField = 'person_id'           -- PersonId field for this Leaf instance
  , @TargetDataBaseName = 'ClinDb'         -- Clinical database to query for this Leaf instance
  , @TotalAllowedRuntimeInMinutes = 180,   -- Total minutes to allow to entire process to run
  , @PerRootConceptAllowedRuntimeInMinutes -- Total minutes to allow a given Root Concept
                                           -- and children to run,
  , @SpecificRootConcept = NULL            -- Optional, specify a Root ConceptId to only 
                                           -- recalculate counts for part of the tree
```

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

We would probably create a Concept tree with a root `Diagnoses` Concept using the ICD10 hierarchy to allow users to run queries to find patients with certain diagnosis codes, such as type 2 diabetes mellitus.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown1.png"/></p>

### Problem 1
**What if users wanted to specify that the diagnosis must come from a specific source, such as `billing` or `radiology`?**

One approach to solve this would be to create child Concepts under **every** diagnosis Concept, with each child representing a diagnosis from a particular source:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown3.png"/></p>

This works to a certain extent, though with every additional diagnosis source, we've doubled the number of diagnosis Concepts. Given that there are roughly 68,000 ICD-10 diagnosis codes as of this writing (not including their parent Concepts which represent ranges of codes), adding child Concepts for just the three example sources above, `billing`, `radiology`, and `charges` will add over 200,000 Concepts to our tree. Just as importantly, this solution may not necessarily be intuitive for users.

### Problem 2
**What if we then wanted to also allow users to specify whether the diagnosis was `primary` or `secondary`?**

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown4.png"/></p>

We could simply add these as additional child Concepts, though users wouldn't be able to find patients who had this as the `primary` diagnosis **and** from `billing`.

Alternatively, we could create `primary` and `secondary` child Concepts under **every** `billing`, `radiology`, and `charges` Concept:

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown5.png"/></p>

Yikes. This creates a Cartesian product of all diagnosis sources and primary/secondary types **for every diagnosis Concept**. This is likely to be both confusing for users and wasteful in visual space (in the UI) and database storage.

### Dropdowns to the Rescue
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown6.gif"/></p>

Dropdowns allow users to make the Concept logic more granular if they choose to, and do so in a visually intuitive way.

### Creating Dropdowns
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown7.gif"/></p>

1) Go to the `Admin` tab and click on any Concept. Under `SQL`, click `Table, View, or Subquery` -> `Manage SQL Sets`.

2) Under the `SQL Set` you'd like to add a dropdown to, click `+Add New Dropdown` in the lower-left.

3) Under `Default Text`, add the text that should be shown if the user hasn't selected a dropdown option.

4) For each option you'd like to add, click `+Add Dropdown Option` and enter the `Text` that should be shown, as well as the `SQL WHERE` clause that should be appended to the Concept SQL if the user selects the option.

5) Click `Save` at the top.

Because dropdowns are tied to `SQL Sets`, every Concept that uses that `SQL Set` is able to enable the dropdown as well, allowing dropdowns to be easily reused across many Concepts.

### Enabling Dropdowns for a Concept
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_dropdown8.gif"/></p>

1) After creating the dropdowns, in the `Admin` screen click the Concept you'd like to enable dropdowns for.

2) Under `Configuration`, make sure `Allow Dropdowns` is set to `true`.

3) Under `Dropdowns`, click each dropdown you'd like to enable. Enabled dropdowns will turn green and say "enabled!".

> If you don't see any dropdowns available, under `SQL` make sure the Concept is using the same `SQL Set` as the dropdowns.

4) Click `Save` at the top.

Users will now see the dropdown options when they drag over the Concept.

## Restricting Access
Certain Concepts may represent sensitive data which you need to restrict access to, such as financial data.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_constraint.gif"/></p>

To restrict access to certain users or groups:

1) In the `Admin` screen, create a new Concept or click an existing Concept to edit.

2) Scroll down to `Access Restrictions` and click `+Add New Restriction`.

3) Select whether you'd like to give a specific `User` access or a `Group`.

4) Enter the `User` or `Group` name, making sure to include the Leaf [Issuer](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#issuer) after the user name.

Note that:

- **All child and descendent Concepts beneath the restricted Concept inherit the restriction.**
- **If there are multiple restrictions, users need to meet only *one* of them in order to access the Concept.**
- **Admins can always see all Concepts, whether restricted or not.** 

## Universal IDs
Universal IDs allow users to query multiple Leaf instances in a federated fashion (see [Networking Multiple Leaf instances](https://github.com/uwrit/leaf/blob/master/docs/deploy/fed/README.md) to learn how this works).

> If you are only planning to query Concepts locally at your institution, you don't need to worry about setting `UniversalIds`.

Federated queries work by mapping the requesting user's local Concepts to the federated node's Concepts by `UniversalId`. `UniversalIds` are defined using the [URN Syntax](https://tools.ietf.org/html/rfc2141).

### Mapping UniversalIds at Query Execution
Assuming multiple Leaf instances have exchanged certificates, user queries can be federated if:

1) Every Concept involved in the user's query has a `UniversalId`, and

2) All federated Leaf instances have Concepts that match the `UniversalIds` used in the query.

Because `UniversalIds` themselves are data-model agnostic and are simply a pointer to an arbitrary Concept, this functionality works even if federated Leaf instances use different data models (see here for a working demonstration https://www.youtube.com/watch?v=ZuKKC7B8mHI).

### Naming Conventions
A Concept representing Outpatient encounters could be defined with the `UniversalId`:

```
urn:leaf:concept:encounter:type=outpatient
```

Or a Concept representing diagnosis codes for hypertension in pregnancy in ICD-10 could be:

```
urn:leaf:concept:diagnosis:coding=icd10+code=O13.9
```

Note that these are simply examples, and you are free to define `UniversalIds` as you'd like. Perhaps the most important point though is to be sure that the `UniversalId` naming conventions for your Leaf instance and any other Leaf instances match exactly.

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_universalid.png"/></p>

You can find `UniversalIds` in the `Admin` panel under `Identifiers` -> `UniversalId`. 

> You don't need to preface `UniversalIds` with "urn:leaf:concept:" yourself, as Leaf will handle that for you.

### Univeral IDs in dropdowns
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_specialization_universalid.gif"/></p>

Note that [dropdown options](#dropdowns-to-the-rescue) also use `UniversalIds` using the naming convention "urn:leaf:specialization:". If you are federating queries across multiple instances, **make sure dropdowns similarly have `UniversalIds` defined**.

### Concepts without Universal IDs
There are inevitably scenarios where although you are federating your queries with other institutions, you still want to expose certain Concepts to your users that are unique to your local database and not expected to be found elsewhere.

Good news: That's okay!

**Leaf expects that not all clinical databases will be identical, and you shouldn't need to hide Concepts from your users simply because other institutions don't have the same data.**

<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/concept_no_universalid.png"/></p>

If a user uses one or more Concepts that are "local only" and don't have `UniversalIds`, Leaf will let them know which institutions weren't able to run the query.

## Creating Concepts by SQL Scripts
Certain Concepts are inherantly hierarchical or voluminous enough that it makes more sense to programmatically add them, such as diagnosis or procedure codes. Head over to the Leaf Scripts repo at https://github.com/uwrit/leaf-scripts to see examples of how to do this.
