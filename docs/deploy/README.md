# Deploying Leaf
Welcome! This page serves as a living document for deploying Leaf to your environment. For suggestions, comments, or questions you think we should address, please let us know by commenting here https://github.com/uwrit/leaf/issues/62.

## Architecture
Leaf is designed to be deployed in a standard [three-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture). These tiers are:
1) Web Server, with
    - [Apache](https://en.wikipedia.org/wiki/Apache_HTTP_Server) or [IIS](https://www.iis.net/overview) installed to handle [https](https://en.wikipedia.org/wiki/HTTPS) routing for the web app. These can be configured to work with a [SAML2](https://en.wikipedia.org/wiki/SAML_2.0) Identity Provider to manage user authentication and authorization, such as [Shibboleth](https://www.shibboleth.net/index/) or [ADFS](https://docs.microsoft.com/en-us/windows-server/identity/active-directory-federation-services).
2) Application Server, with
    - [.NET Core Runtime](https://dotnet.microsoft.com/download) installed.
    - Note that this *can* be the same server as the web server, though ideally they should be separate depending on hardware, relative load, and number of users.
3) Database Server, with
    - The clinical database you'd like to point Leaf at (e.g. [OMOP](https://www.ohdsi.org/data-standardization/the-common-data-model/)) deployed in [MS SQL Server](https://www.microsoft.com/en-us/sql-server/default.aspx) (2017+).
    - [Leaf application database](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.sql). Note that this *must* be the same server the clinical database ↑ is deployed to.
    - [UMLS database](https://www.nlm.nih.gov/research/umls/) (optional). This can be used to script out creation of Leaf Concepts. See examples at https://github.com/uwrit/leaf-scripts. Note that you [must agree to and maintain a current UMLS license](https://www.nlm.nih.gov/databases/umls.html) for this step.

```
If you'd like to develop or experiment with Leaf on your local computer (with no users but yourself), you can of course clone the repo and run a Leaf dev instance locally without the above setup.
```

## Getting Started
1) Web Server
    - Setting up Apache or IIS
2) Application Server
    - [Creating a JWT Signing Key](https://github.com/uwrit/leaf/tree/master/docs/deploy/app/README.md#creating-a-jwt-signing-key)
    - [Setting Environment Variables](https://github.com/uwrit/leaf/tree/master/docs/deploy/app/README.md#setting-environment-variables)
    - [Configuring the appsettings.json file](https://github.com/uwrit/leaf/tree/master/docs/deploy/app/README.md#configuring-the-appsettingsjson-file)
3) Database server
    - [Installing the Leaf application database](https://github.com/uwrit/leaf/tree/master/docs/deploy/db/README.md#installing-the-leaf-application-database)
