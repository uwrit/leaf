## Installing the Leaf application database

1) Create a database on your server to serve as the Leaf application database. This can be as simple as

```sql
CREATE DATABASE LeafDB
```

Though you should probably take into consideration storage and so on first. The database name can be whatever you'd like, and be sure that the connection string in your [LEAF_APP_DB](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#setting-environment-variables) environment variables points to this database.

> Before exectuting the scripts below, be sure to preface each script with `USE <my_db_name> GO` before executing.

2) Populate the database `tables`, `stored procedures`, and `functions` using the [LeafDB.Schema.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.Schema.sql) script.

3) Populate the initialization data using the [LeafDB.Init.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.Init.sql) script.

4) Populate the [CMS General Equivalence Mapping (GEMs)](https://www.cms.gov/Medicare/Coding/ICD10/2018-ICD-10-CM-and-GEMs.html) data using the [LeafDB.GEMs.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.GEMs.sql) script. These allow the Concept search box to suggest ICD10 -> ICD9 or ICD9 -> ICD10 equivalents if users search for a specific ICD10/9 code.

## Defining the instance Name, Description, and Colorset
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/identity.gif"/></p>
It's important to give users an understanding of the database(s) to give some context, and even more so if you are querying multiple Leaf instances and need to appropriately identify your database to local and outside users.

To set the name, abbreviate, description, and colors used to represent your institution, insert a record into the `network.Identity` table.

For example:

```sql
INSERT INTO [network].[Identity]
SELECT 
    [Lock] = 'X'
   ,[Name] = 'University of Example'
   ,[Abbreviation] = 'UE'
   ,[Description] = 'The University of Example Medical Center is a large ' +
                    'medical system representing two hospitals' +
                    'and over 400 regional clinics.'
   ,[TotalPatients] = 2200000
   ,[Latitude] = 47.6062
   ,[Longitude] = 122.3321
   ,[PrimaryColor] = 'rgb(75, 46, 131)'
   ,[SecondaryColor] = 'rgb(183, 165, 122)'
```
