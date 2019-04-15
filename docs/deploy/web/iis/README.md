## Setting up IIS

1) Install the [.NET Core Hosting Bundle](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-2.2)
2) Install [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
   - Create a URL rewrite rule on the site with the following template.
   ```xml
   <rewrite>
        <rules>
            <rule name="add {applicationName}">
                <match url="^(api/.*)" />
                <action type="Rewrite" url="{applicationName}/{R:0}" appendQueryString="false" logRewrittenUrl="true" />
            </rule>
        </rules>
    </rewrite>
   ```
   - Note: Do NOT name the API application "api", this will cause the rewrite rule to apply recursively until the request fails. At UW we name the backing application "leafapi".