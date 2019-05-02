# IIS
- [Single Combined IIS/API Server](#single-combined-iis/api-server)

## Single Combined IIS/API Server
1) Install the [.NET Core Hosting Bundle](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-2.2)
2) Install [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
3) Install [Shibboleth Service Provider 3](https://wiki.shibboleth.net/confluence/display/SP3/Install+on+Windows#InstallonWindows-Installation)
   - Check `Configure IIS7 Module` box during installation.
4) Create an Application pool to run the site and API.
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/deploy/images/iis_app_pool.png" /></p>

5) Create the website to host the Leaf browser application.
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/deploy/images/iis_website.png" /></p>

6) Create an application behind the site to host the API.
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/deploy/images/iis_api.png" /></p>

   - Note: Do NOT name the API application "api", this will cause the rewrite rule to apply recursively until the request fails. At UW we name the backing application "leafapi".
7) Create a URL rewrite rule on the site with the following template.
<p align="center"><img src="https://github.com/uwrit/leaf/blob/master/docs/deploy/images/iis_url_rewrite.png" /></p>

web.config

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
8) Configure Shibboleth SP3 for the site and api.
   - See [SAML2](https://github.com/uwrit/leaf/tree/master/docs/deploy/saml2) configuration documentation.
