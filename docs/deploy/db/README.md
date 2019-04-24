## Installing the Leaf application database

1) Create a database on your server to serve as the Leaf application database. This can be as simple as

```sql
CREATE DATABASE LeafDB
```

Though you should probably take into consideration storage and so on first. The database name can be whatever you'd like, and be sure that the connection string in your [LEAF_APP_DB](https://github.com/uwrit/leaf/blob/master/docs/deploy/app/README.md#setting-environment-variables) environment variables points to this database.

2) Populate the database `tables`, `stored procedures`, and `functions` using the [LeafDB.Schema.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.Shema.sql) script. Be sure to preface the script with `USE <my_db_name> GO` before executing.

3) Populate the initialization data using the [LeafDB.Init.sql](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.Init.sql) script. Be sure to preface the script with `USE <my_db_name> GO` before executing.