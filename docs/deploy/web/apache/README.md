# Configuring Leaf with Apache
The following is an example snippet of an httpd.conf file to host a multi-node Leaf deployment, for example at a single organization with multiple warehouse database servers. In this example, there are three warehouse databases, each one is targeted by a dedicated Leaf API instance. Not including the database servers, this example represent 4 distinct servers: a web server (Apache), 3 application servers (API).

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

        # optional subnet restriction
        Require ip {restricted-subnet}

        AuthType shibboleth
        ShibRequireSession On
        ShibUseHeaders On

        # optional users restriction, although this only determines access to the app, not a user's underlying authorization within the app
        # cat /data/leaf/users.conf --> leafusers: eppns...
        AuthGroupFile /data/leaf/users.conf
        require group leafusers

      </RequireAny>

    </Location>

    # node 1: home node, endpoint node
    <Location /api>
      ProxyPass         http://{node1-ip}:{node1-port}/api
      ProxyPassReverse  http://{node1-ip}:{node1-port}/api
    </Location>

    # node 2: endpoint node
    <Location /leaf2/api>
      ProxyPass         http://{node2-ip}:{node2-port}/api
      ProxyPassReverse  http://{node2-ip}:{node2-port}/api
    </Location>

    # node 3: endpoint node
    <Location /leaf3/api>
      ProxyPass         http://{node3-ip}:{node3-port}/api
      ProxyPassReverse  http://{node3-ip}:{node3-port}/api
    </Location>

</VirtualHost>