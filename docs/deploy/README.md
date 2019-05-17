# Deploying Leaf
Welcome! This page serves as a living document for deploying Leaf to your environment. For suggestions, comments, or questions you think we should address, please feel free to open an issue.

## Architecture
Leaf is designed to be deployed in a standard [three-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture). These tiers are:
1) **Web Server**, with
    - [Apache](https://en.wikipedia.org/wiki/Apache_HTTP_Server) or [IIS](https://www.iis.net/overview) installed to handle [https](https://en.wikipedia.org/wiki/HTTPS) routing for requests from the [client app](https://github.com/uwrit/leaf/tree/master/src/ui-client). These can be configured to work with a [SAML2](https://en.wikipedia.org/wiki/SAML_2.0) Identity Provider to manage user authentication and authorization, such as [Shibboleth](https://www.shibboleth.net/index/) or [ADFS](https://docs.microsoft.com/en-us/windows-server/identity/active-directory-federation-services).
2) **Application Server**, with
    - [.NET Core Runtime](https://dotnet.microsoft.com/download) installed.
    - Note that this *can* be the same server as the web server, though ideally they should be separate depending on hardware, relative load, and number of users.
3) **Database Server**, with
    - The clinical database you'd like to point Leaf at deployed in [MS SQL Server](https://www.microsoft.com/en-us/sql-server/default.aspx) (2014+).
    - [Leaf application database](https://github.com/uwrit/leaf/blob/master/src/db/build/LeafDB.sql). Note that this *must* be the same server the clinical database ↑ is deployed to.
    - [UMLS database](https://www.nlm.nih.gov/research/umls/) (optional). This can be used to script out creation of Leaf Concepts related to diagnoses, procedures, etc. See examples at https://github.com/uwrit/leaf-scripts. Note that you [must agree to and maintain a current UMLS license](https://www.nlm.nih.gov/databases/umls.html) for this step.

![Single Instance](https://github.com/uwrit/leaf/blob/master/docs/deploy/images/single_instance_no_header.png "Single Instance") 

> If you'd like to develop or experiment with Leaf on your local computer (with no users but yourself), you can of course clone the repo and run a Leaf dev instance locally without the above setup.

## Installation Steps
1) Web Server
    - [Setting up Apache](https://github.com/uwrit/leaf/tree/master/docs/deploy/web/apache/README.md) or [IIS](https://github.com/uwrit/leaf/tree/master/docs/deploy/web/iis/README.md)
    - [Building and deploying the client application](https://github.com/uwrit/leaf/tree/master/docs/deploy/web/client/README.md)
2) Application Server
    - [Creating a JWT Signing Key](https://github.com/uwrit/leaf/tree/master/docs/deploy/app/README.md#creating-a-jwt-signing-key)
    - [Setting Environment Variables](https://github.com/uwrit/leaf/tree/master/docs/deploy/app/README.md#setting-environment-variables)
    - [Configuring the appsettings.json file](https://github.com/uwrit/leaf/tree/master/docs/deploy/app/README.md#configuring-the-appsettingsjson-file)
3) Database server
    - [Installing the Leaf application database](https://github.com/uwrit/leaf/tree/master/docs/deploy/db/README.md#installing-the-leaf-application-database)

## Configuring Leaf for your Data
1) [Creating Concepts](https://github.com/uwrit/leaf/tree/master/docs/admin/concept/README.md)
2) [Defining the Basic Demographics Dataset](https://github.com/uwrit/leaf/blob/master/docs/admin/dataset/README.md#basic-demographics)
3) [Setting the Instance Name, Description, and Colors](https://github.com/uwrit/leaf/blob/master/docs/deploy/db/README.md#defining-the-instance-name-description-and-colorset)
4) [Adding Other Datasets](https://github.com/uwrit/leaf/blob/master/docs/admin/dataset/README.md#adding-datasets)

## Networking Multiple Leaf instances
One powerful feature of Leaf is the ability to federate user queries to multiple Leaf instances, even those using different data models. This enables institutions to securely compare patient populations in a de-identified fashion. An example of this functionality can be found at https://www.youtube.com/watch?v=ZuKKC7B8mHI. 

> Networking with other Leaf instances is **completely optional**. Deploying locally and querying only your institution's data is perfectly fine.

[Learn how to network multiple Leaf instances](https://github.com/uwrit/leaf/tree/master/docs/deploy/fed/README.md)

![Multi Instance](https://github.com/uwrit/leaf/blob/master/docs/deploy/images/multi_instance_no_header.png "Multi Instance")


