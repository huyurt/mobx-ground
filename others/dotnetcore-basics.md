# .Net Core

## Running `dotnet` commands using `dotnet watch`

Any `dotnet` command can be run with `dotnet watch`

For example:

| Command                          | Command with watch                     |
| -------------------------------- | -------------------------------------- |
| `dotnet run`                     | `dotnet watch run`                     |
| `dotnet run -f net451`           | `dotnet watch run -f net451`           |
| `dotnet run -f net451 -- --arg1` | `dotnet watch run -f net451 -- --arg1` |
| `dotnet test`                    | `dotnet watch test`                    |

# .Net Core Entity Framework

## Installing the tools

| Description            | Command                                                 |
| ---------------------- | ------------------------------------------------------- |
| Install the tool       | dotnet tool install --global dotnet-ef                  |
| Update the tool        | dotnet tool update --global dotnet-ef                   |
| Add neccessary package | dotnet add package Microsoft.EntityFrameworkCore.Design |
| Verify installation    | dotnet ef                                               |

## Create migration

````
dotnet ef migrations add <MigrationName> --output-dir Your/Directory
````

## Listing migrations

````
dotnet ef migrations list
````

## Update (or Create) Database

````
dotnet ef database update --environment Production
````

## References

1. https://jakeydocs.readthedocs.io/en/latest/index.html
2. https://docs.microsoft.com/tr-tr/ef/core/managing-schemas/
3. https://www.entityframeworktutorial.net/efcore/cli-commands-for-ef-core-migration.aspx