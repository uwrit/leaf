# Configuring Leaf Client with Apache

The following is an example snippet of an httpd.conf file to host a single node in a Leaf deployment. 

Currently each leaf client webapp must be hosted at the top level of the DocumentRoot of an apache VirtualHost. Multiple nodes could be hosted on a single apache instance pointing at that same DocumentRoot, however each would need it's own VirtualHost and unique dns name defined (eg. site1.leaf.school.edu, site2.leaf.school.edu).

In the below example, the Shibboleth module is used to authenticate users via SAML2 and provide group membership to the app. If you want to define your own set of groups that limit access to the app via apache (ie during pre-release or evaluation), you can define your own apache groups via the AuthGroupFile directive and then require those groups.  

```xml
<VirtualHost *:443>

    ServerName leaf.{subdomain}.{domain}.{tld}
    ServerAlias leaf
    DocumentRoot /data/www
    HostnameLookups Off
    ErrorLog logs/leaf_ssl_error_log
    CustomLog logs/leaf_ssl_access_log combinedio

    SSLEngine on
    SSLProtocol all -SSLv2 -SSLv3
    SSLHonorCipherOrder on
    SSLCipherSuite HIGH:!aNULL:!MD5:!AECDH:!ADH
    SSLCertificateFile /etc/pki/tls/certs/{leaf-cert}.cert
    SSLCertificateKeyFile /etc/pki/tls/private/{leaf-key}.key
    SSLCertificateChainFile /etc/pki/tls/certs/{cert-chain}.cert

    SetEnvIf User-Agent ".*MSIE.*" \
        nokeepalive ssl-unclean-shutdown \
        downgrade-1.0 force-response-1.0

    <Files *.sso>
        SetHandler shib-handler
    </Files>

    <Location />

      <RequireAny>

        # Optional subnet restriction
        Require ip {restricted-subnet}

        # Authentication provider Setup
        AuthType shibboleth
        ShibRequireSession On
        ShibUseHeaders On
        Require shibboleth

        # optional users restriction, although this only determines access to the app, not a user's underlying authorization within the app
        # cat /data/leaf/users.conf --> leafusers: eppns...
        AuthGroupFile /data/leaf/users.conf
        require group leafusers

      </RequireAny>

    </Location>

    # API proxy directive, overall api doesn't require user session

    <Location /api>
      ProxyPass         http://{node1-ip}:{node1-port}/api
      ProxyPassReverse  http://{node1-ip}:{node1-port}/api
      
        <RequireAny>
            AuthType shibboleth
            ShibRequireSession Off 
		    Require shibboleth
         </RequireAny>

    </Location>

  # /api/user does require user session
    <Location /api/user>
         <RequireAny>
               AuthType shibboleth
               ShibRequireSession On
		       Require shibboleth
         </RequireAny>
 </Location>

</VirtualHost>
```


## SELinux and Apache
If you have SELinux enabled on your system, you need to be aware of an additional set of controls specifically related to running Apache.

By default with SELinux enabled httpd connections to other apps not located on localhost are regulated. If your API server is located on another host you will need to enable httpd to make outbound connections.

To enable httpd connections to non-standard ports: 

```
setsebool -P httpd_can_network_connect on
```

Depending on which ports you use for your API service you may need enable other booleans (ie httpd_can_network_connect_db, httpd_use_openstack). To see the complete list of variables on your system and their present status:

```
getsebool -a  | grep httpd
```

If you decide to use non-standard directory to host your webapp you will also need to re-label the files in that directory so that httpd can properly access the webapp files. Using the location in the example above:

```
semanage fcontext -a -t httpd_sys_content_t "/data/www(/.*)?"
restorecon -R -v /data/www
```

