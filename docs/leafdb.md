# Ensuring Urn Filter Alignment

When creating the database docker image, the `@@SERVERNAME` may not match the container name causing `scripts/leafdb.sh` to fail. To correct this issue:

```sql
SELECT @@SERVERNAME

EXEC sp_dropserver {server_name}
GO

EXEC sp_addserver {container_id}, local
GO
```
Then restart the database container.

# Generating Database Source Code
`./scripts/leafdb.sh` will generate the schema and source code files for the database.

`./scripts/leafdb.sh -d/--include-data` will generate the schema, source code files, and the seeded data files for the database.
