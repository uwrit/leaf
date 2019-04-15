## Installing the Leaf application database
The Leaf application database can be built using the [LeafDB.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.sql) file. Unmodified, executing the file will build the Leaf application database in the environment it is executed in and all necessary SQL objects.

## Before running the DB build script
The current database create script builds a full database for our development environment, using SQL Server in a Linux Docker container. This is likely not what you need, so first do the following steps:

1) Create a new empty database in the database server you plan to use. This will be your Leaf application database. The default name for this is typically `LeafDB`, though you should create a name suitable for your environment.
2) Copy over the Leaf database build script at https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.sql. **Do Not** execute the first ~80 lines or so, as these lines are boilerplate code to build the database (which you've already completed in step (1)). Instead, execute from [line 83 or so](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.sql#L83), `USE [LeafDB]`, substituting your preferred database name for `[LeafDB]`.
3) Execute the shortened script. This will build out the database objects needed.