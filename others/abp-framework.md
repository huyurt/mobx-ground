# ABP CLI

## Installation

| Description                                              | Command                             |
| -------------------------------------------------------- | ----------------------------------- |
| Install                                                  | dotnet tool install -g Volo.Abp.Cli |
| Update                                                   | dotnet tool update -g Volo.Abp.Cli  |
| Shows a general or about the [command-name] command help | abp help [command-name]             |

## Application Startup Template

````
abp new [SolutionName] -t app -u angular -d ef
````

### Specify the UI Framework

This template provides multiple UI frameworks:

| Description                                    | Command Name |
| ---------------------------------------------- | ------------ |
| ASP.NET Core MVC UI with Razor Pages (default) | mvc          |
| Blazor UI                                      | blazor       |
| Angular UI                                     | angular      |

### Specify the Database Provider

Use `-d` (or `--database-provider`) option to specify the database provider:

| Description                     | Command Name |
| ------------------------------- | ------------ |
| Entity Framework Core (default) | ef           |
| MongoDB                         | mongodb      |

### Specify the Mobile Application Framework

Use `-m` (or `--mobile`) option to specify the mobile application framework:

| Description  | Command Name |
| ------------ | ------------ |
| React Native | react-native |

## Init Database

````
cd ~\aspnet-core\src\[SolutionName].DbMigrator
dotnet ef database update
````

## Init Api

````
cd ~\aspnet-core\src\[SolutionName].HttpApi.Host
dotnet watch run
````

## Init Ui

````
cd ~\angular
npm install
````

# References

1. https://docs.abp.io/en/abp/latest/Startup-Templates/Application