## Installing the Leaf application database

1) Create a database on your server to serve as the Leaf application database. This can be as simple as

```sql
CREATE DATABASE LeafDB
```

Though you should probably take into consideration storage and so on first. The database name can be whatever you'd like, and be sure that the connection string in your [LEAF_APP_DB](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#setting-environment-variables) environment variables points to this database.

2) Populate the database `tables`, `stored procedures`, and `functions` using the [LeafDB.Schema.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.Shema.sql) script. Be sure to preface the script with `USE <my_db_name> GO` before executing.

3) Populate the initialization data using the [LeafDB.Init.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.Init.sql) script. Be sure to preface the script with `USE <my_db_name> GO` before executing.

## Defining the instance Name, Description, and Colorset
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/admin/images/identity.gif"/></p>
It's important to give users an understanding of the database(s) to give some context, and even more so if you are querying multiple Leaf instances.

To set the name, abbreviate, description, and colors used to represent your institution, you must insert a record into the `network.Identity` table.

For example:

```sql
INSERT INTO [network].[Identity]
SELECT 
    [Lock] = 'X'
   ,[Name] = 'University of Example'
   ,[Abbreviation] = 'UE'
   ,[Description] = 'The University of Example Medical Center is a large medical system representing two hospitals' +
   		    'and over 400 regional clinics.'
   ,[TotalPatients] = 2200000
   ,[Latitude] = 47.6062
   ,[Longitude] = 122.3321
   ,[PrimaryColor] = 'rgb(75, 46, 131)'
   ,[SecondaryColor] = 'rgb(183, 165, 122)'
```
