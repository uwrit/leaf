# IIS
- [Single Combined IIS/API Server](#single-combined-iis/api-server)

## Single Combined IIS/API Server
1) Install the [.NET Core Hosting Bundle](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-2.2)
2) Install [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
   - Create a URL rewrite rule on the site with the following template.
   ```xml
    <system.webServer>
        ...additional configuration
        <rewrite>
            <rules>
                <rule name="add {applicationName}">
                    <match url="^(api/.*)" />
                    <action type="Rewrite" url="{applicationName}/{R:0}" appendQueryString="false" logRewrittenUrl="true" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
   ```
   - Note: Do NOT name the API application "api", this will cause the rewrite rule to apply recursively until the request fails. At UW we name the backing application "leafapi".
3) Install [Shibboleth Service Provider 3](https://wiki.shibboleth.net/confluence/display/SP3/Install+on+Windows#InstallonWindows-Installation)
   - See [SAML2](https://github.com/uwrit/leaf/tree/master/docs/deploy/saml2) for IdP specific configuration.
4) Create the website to host the Leaf browser application.
![Example](https://github.com/uwrit/leaf/blob/master/docs/deploy/images/iis_website.png "Example")
5) Create an application behind the site to host the API. TODO