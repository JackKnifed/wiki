topic: ssl
title: Core Managed SSL

Core Managed SSL Installation
=============================

Common SSL locations
--------------------

You can put the certs, keys, and csr's wherever you want. These are some common places to put them.

* **Core managed**
 * `/etc/ssl/`
 * `/etc/pki/tls/`
 * `/usr/share/`

Preserving past Certs
---------------------

It's recommended that, whenever you create a new key, cert, csr, or CA bundle file, you preserve the old file - in case you need it again. It's a few kilobytes, and very useful if you ever need it.

You can append the date (in [ISO 8601 format](https://xkcd.com/1179/)) to the end of the file to label it. You can then create a symlink pointing to the current proper certificate and update the symlink as needed. The format to create a symlink is:

```bash
ln -s -f /target/file/the/symlink/points.at /location/where/to/put/the.symlink
```

Getting a Cert
--------------

The process is simple:

* Generate a key - encrypts everything on your end
* Generate a CSR - Certificate Signing Request
* Purchase a Cert - send the CSR to GlobalSign, pay them money, and they vet you and give back a certificate that they have signed
* Install the Cert - falls under Apache configuration, and is not included with the SSL purchase

The one difference is, you have to do all of this from command line.

### Key generation ###

To create a `x.509` certificate key, `4096 bit` strength, use the following commands:

```bash
touch /etc/pki/tls/private/domain.com.key.$(date -u +%Y-%m-%d)
chmod 600 /etc/pki/tls/private/domain.com.key.$(date -u +%Y-%m-%d)
openssl genrsa -out /etc/pki/tls/private/domain.com.key 4096.$(date -u +%Y-%m-%d)
chmod u-w /etc/pki/tls/private/domain.com.key.$(date -u +%Y-%m-%d)
```

Your key folder should be locked down also - absolute minimal permissions and ownership required.

### CSR generation ###

To generate a `CSR` - Certificate Signing Request run the following:

```bash
openssl req -new -nodes -key  /etc/pki/tls/private/domain.com.key -out /etc/pki/tls/csrs/domain.com.csr.$(date -u +%Y-%m-%d)
```

This will prompt you for input for the certificate:
```nohighlight
You are about to be asked to enter information that will be incorporated into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code):
State or Province Name (full name):
Locality Name (eg, city):
Organization Name (eg, company):
Organizational Unit Name (eg, section):
Common Name (eg, your name or your server's hostname):
Email Address:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password:
An optional company name:
```

info> `Common Name` needs to be the `FQDN` (i.e. www.domain.com), or the SSL issuer will reject the CSR.

After completing this, the CSR can be viewed with:

```bash
cat /etc/pki/tls/csrs/domain.com.csr.$(date -u +%Y-%m-%d)
```

### SSL installation ###
To install the certificate, go to the SSL directory on the server and create files for the cert and cabundle:

```bash
touch domain.com.crt.$(date -u +%Y-%m-%d)
touch domain.com.cabundle.$(date -u +%Y-%m-%d)
```

Then put the cabundle and Cert into those files. If the server is already set up with symlinks, re-symlink and restart Apache and you are set.

### If the symlinks and vhost are not already set up ###

Often, the Apache config is at /etc/httpd/vhosts.d/. You probably want to copy the port 80 vhost, change the port, change some stuff:

```nohighlight
<VirtualHost (sites ip here):443>

        ServerName domain.com
        DocumentRoot /var/www/(username goes here)/www/
        UseCanonicalName Off

        SSLEngine on
        SSLCertificateFile /etc/pki/tls/certs/domain.com.crt
        SSLCertificateKeyFile /etc/pki/tls/private/domain.com.key
        SSLCACertificateFile /etc/pki/tls/certs/domain.com.root.crt
        SSLCertificateChainFile /etc/pki/tls/certs/domain.com.intermediate.crt
        SetEnvIf User-Agent ".*MSIE.*" nokeepalive ssl-unclean-shutdown

</VirtualHost>
```

You will also have to create the symlinks - the configured certificate in the Apache conf to the actual one.
