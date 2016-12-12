topic: ssl
title: OpenSSL

OpenSSL
=======

## Possible Options on an SSL ##

We offer a few options with our various types of SSLs:

#### `SAN` - Subject Alternate Name ####

A SAN allows you to add additional domain names to an SSL. Depending on the type of SSL, they can either be a different domain name, or a subdomain name.

#### Wildcard ####

A Wildcard SSL allows you to secure the domain name, and match anything in front of it (not including `.`'s).

#### `UC` - Unified Communication ####

info> This information is specific to outlook.

Outlook looks at the subdomains `owa`, `mail`, and `autodiscover`. These are for Exchange. When setting up an Exchange server and using encryption, you should have these subdomains pointed at the Exchange server, and make sure the SSL includes these subdomains as SANs.

Microsoft calls certificates with these three subdomains a *Unified Communications* certificate.

These can be requested at any time at no cost regardless of the certificate type.


## SSL Types ##

Different options are available with different SSL types.

#### Domain SSL ####

The standard SSL. When we purchase these, we purchase them for `www.domain.com` and they are then also valid for `domain.com`. These come with the following options:

* Subdomain SANs
* Wildcard SSLs
* UC SSLs

#### `OrgSSL` Organization SSL ####

A SSL offered with more vetting, and more trust. Due to the additional vetting, these are more expensive. These offer all options:

* Subdomain SANs
* UC SSLs
* Widlcard SSLs
* Domain SANs

#### `EVSSL` - Extra Validation SSL ####

This SSL gives the Green bar in browsers. It's the only one. Part of this certificate is an amount of additional vetting, so expect to have this take some time. The following options are available:

* Subdomain SANs
* UC SSLs
* Domain SANs

## Renewals ##

When processing an SSL renewal, you can reuse a previous CSR. Reconfirm all of the details with the CSR, then you can use it.

Previous CSR's are stored in either `/etc/pki/tls/certs/` or `/var/cpanel/ssl/system/csrs/`. Alternatively, if you can find the old SSL in either GlobalSign, or Manage, and can view the credentials in the CSR there, you can confirm them there.

You can print out the contents of a raw CSR with:

```bash
openssl req -in domain.csr -noout -text
```

* If the old certificate is in manage, simply reorder it in manage.
* If the old certificate is in GlobalSign but not manage, reorder it in Globalsign.
* If the old certificate cannot be found, you can create a new order with the old CSR, but it will be valid from the purchasing time.

info> For step-by-step renewal process guide, [GlobalSign has a nice guide for doing this through their site](https://support.globalsign.com/customer/portal/articles/1322049-renew-your-ssl-certificate)

## Cancel ##

An order may be cancelled within 7 days of being issued. If you cancel it within that time period with GlobalSign, we get the cost refunded. If we get the cost refunded, the customer gets the cost refunded.

An order can also be cancelled and reordered with details changed. There is a price for this - any price charged to us is the amount we charge the customer for this.

## Revoking ##

Every once in a while, for one reason or another we need need to revoke an SSL that's already been issued.

You revoke an SSL from inside of GlobalSign. Revoking an SSL will not buy back any time from the SSL. It will also invalidate the private key that the SSL used. However, we are more concerned with making the SSL invalid than getting money back. The following will become invalid when recoking an SSL:

* key
* CSR
* CRT

Everything has to be reissued. You should also look at the cancelling section.

## Host Service SSL ##

Services like cPanel, WHM, Exim/Postfix, the FTP server, the IMAP/POP server, and Plesk can all be secured with an SSL. This is recommended for security conscious customers.

In order to do this, there needs to be an SSL installed on server services that matches the hostname. This is not an option on the SSL, this is just something you choose to do with the SSL.

## Extra Vetting ##
Every once in a while an SSL will be selected for extra vetting. Often this means that your SSL has been simply selected randomly to be double checked by hand.

If an SSL ends up in extra vetting, let the customer know as it will likely take extra time to get the SSL.

If you work again within 24 hours, do not hand off the ticket - instead set the ticket to on-hold at the end of your shift and check on the ticket next time you are in.

There is nothing we can do about this to speed the process up - GlobalSign needs to be confident in the SSLs that they issue, so they manually check a certain amount. 

You can decrease the chance of ending up in Extra Vetting by making sure that the whois information on record matches the information used to generate the CSR.

warning> **Do not change verification methods**. If the verification method is changed the SSL is auto cancelled and a new SSL order is then created by the API. The new SSL order will then also need to go through extra vetting, which will increase the time it takes before the SSL is issued.

## Insecure Content ##

Insecure content warnings often look like a yellow lock, a broken lock, or an unlocked symbol on a `https://` site - every browser uses different icons. Older versions of IE pop an error for this.

notice> This is not an issue with the SSL, but the site. Remove the `http://` links on a `https://` site and this will work.

This means that there is a `http://` link on a `https://` page. You can find this link by viewing the source of the page, and searching for `http:`. If there are no matches for that, the lock will not show.

With many sites you have to configure the site to use `https` instead of `non-https` in a configuration file. Sometimes, customers will have to change code.

info> You can change the `http://` links to `//` links - `https://www.liquidweb.com/static/images/favicon.ico` -> `//www.liquidweb.com/static/images/favicon.ico` and the browser will automatically detect `http` or `https` and follow it as appropiate.

## SSL Certificate seal ##
Customer can go [to this link to generate a seal for their site](https://www.globalsign.com/ssl/secure-site-seal/).

This is also mentioned in the SSL Certificate Email from GlobalSign.

## Default VirtualHost ##
With SNI, you can put multiple domains on the main shared IP.

If you go to `http://ip:80` for any IP on a server, it'll give you the first vhost on that IP. Most of the time this first vhost is the cPanel default port 80 vhost that serves up the main docroot. cPanel does not put in a similar vhost for port 443. Because of this, any server with any 443 vhosts by default will serve the first configured 443 site to `https://ip:443`.

To remedy this, you can simply add a vhost. In the file `/usr/local/apache/conf/includes/pre_virtualhost_global.conf`

Add in the following vhost:

```nohighlight
<VirtualHost mainIP:443>
    ServerName hostname
    DocumentRoot /usr/local/apache/htdocs
    ServerAdmin customer@email.com
    <IfModule mod_suphp.c>
        suPHP_UserGroup nobody nobody
    </IfModule>
    SSLEngine on
    SSLCertificateFile /var/cpanel/ssl/cpanel/cpanel.pem
    SetEnvIf User-Agent ".*MSIE.*" nokeepalive ssl-unclean-shutdown
    SSLOptions +StdEnvVars
</VirtualHost>
```

notice> Before cPanel 11.40, the SSLCertificateFile will be at /var/cpanel/ssl/cpanel/mycpanel.pem.

Apache will use cPanel's SSL for this. You need to make sure you edit the IP, Hostname, and ServerAdmin email address.

info> There will still be an error for visitors as the SSL does not match the domain name they asked for. **This is expected**. The goal of this method is to give your visitors a neutral site if they do click through that warning.

## Employee SSL ##

Employees may create up to one certificates for free for their own personal use. There are restrictions however:

* These cannot be sold/resold
* These cannot be provided to a third party
* These must be used on your personal server
* These must be issued for a domain you own
* These cannot be for domains that could be interpreted as fraudulent in any way
* Only a standard DomainSSL can be used
* These cannot contain a SAN (subdomain or otherwise)
* These cannot be a wildcard certificate

## Verifying parts of an SSL ##

#### Verifying Keys/Certs/CSR's Match ####

To return the modulus of the cert/key/csr, use the commands below. If the modulus matches, they are paired.

* Cert: `openssl x509 -noout -modulus -in certificate.crt | openssl md5`
* Key: `openssl rsa -noout -modulus -in privateKey.key | openssl md5`
* CSR: `openssl req -noout -modulus -in CSR.csr | openssl md5`

To output the contents of a certificate:

```bash
openssl x509 -in certificate.crt -text -noout
```

#### Verifying Installation with Curl ####

Curl works rather nicely for this, giving you good output. Just run:

```bash
curl -k -w "%{ssl_verify_result}\n" -o /dev/null -s https://google.com
```

If you get a 0 back from that, the SSL is working properly. If you do not, there is a problem. You can also look at the response with:

```bash
curl -k -v -s https://google.com
```

```
* About to connect() to google.com port 443 (#0)
*   Trying 2607:f8b0:4009:801::1003...
* Connected to google.com (2607:f8b0:4009:801::1003) port 443 (#0)
* successfully set certificate verify locations:
*   CAfile: none
  CApath: /etc/ssl/certs
* SSLv3, TLS handshake, Client hello (1):
* SSLv3, TLS handshake, Server hello (2):
* SSLv3, TLS handshake, CERT (11):
* SSLv3, TLS handshake, Server key exchange (12):
* SSLv3, TLS handshake, Server finished (14):
* SSLv3, TLS handshake, Client key exchange (16):
* SSLv3, TLS change cipher, Client hello (1):
* SSLv3, TLS handshake, Finished (20):
* SSLv3, TLS change cipher, Client hello (1):
* SSLv3, TLS handshake, Finished (20):
* SSL connection using ECDHE-ECDSA-RC4-SHA
* Server certificate:
* 	 subject: C=US; ST=California; L=Mountain View; O=Google Inc; CN=*.google.com
* 	 start date: 2013-06-19 12:41:19 GMT
* 	 expire date: 2013-10-31 23:59:59 GMT
* 	 issuer: C=US; O=Google Inc; CN=Google Internet Authority
* 	 SSL certificate verify ok.
> GET / HTTP/1.1
> User-Agent: curl/7.29.0
> Host: google.com
> Accept: */*
> 
< HTTP/1.1 301 Moved Permanently
< Location: https://www.google.com/
< Content-Type: text/html; charset=UTF-8
< Date: Sat, 06 Jul 2013 18:22:37 GMT
< Expires: Mon, 05 Aug 2013 18:22:37 GMT
< Cache-Control: public, max-age=2592000
< Server: gws
< Content-Length: 220
< X-XSS-Protection: 1; mode=block
< X-Frame-Options: SAMEORIGIN
< 
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="https://www.google.com/">here</A>.
</BODY></HTML>
* Connection #0 to host google.com left intact
```

#### Verifying Installation with OpenSSL

OpenSSL can be used to verify a certificate:

```bash
openssl s_client -connect google.com:443 -showcerts -CApath /etc/ssl/certs/ < /dev/null
```

You can also connect with `s_client` and request a page:

```bash
    openssl s_client -connect google.com:443 -CApath /etc/ssl/certs/ < /dev/null
```

notice> For the s_client commands, you will need to provide the OpenSSL client the full path to your certs, if they are not automatically detected.

#### Date On Remote Certificate ####

```bash
openssl s_client -connect bvp.bvpdesign.com:465 2>/dev/null|openssl x509 -noout -dates
notBefore=Apr  8 17:02:09 2015 GMT
notAfter=May  7 07:21:25 2016 GMT
```

## Issuing a Certificate as a Self Signed Cert ##

So, let's say a customer wants a cert, but they don't want to pay for it. They just want it self signed. Well, WE CAN DO THAT. It's stupid, but we can.

Once you have the matching csr and key, sign it!

```bash
openssl x509 -req -days 730 -in /etc/ssl/certs/flydepot.com.csr -signkey /etc/ssl/private/flydepot.com.key -out /etc/ssl/certs/flydepot.com.crt.lwnew
```

More Importantly, if they want to do this, you might want to set them up a "fake" root CA and use that. If you were to do this:

```bash
openssl req -new -x509 -extensions v3_ca -keyout private/cakey.pem -out cacert.pem -days 365 -config ./openssl.cnf
```

[You can find more infomation on this here](http://www.flatmtn.com/article/setting-openssl-create-certificates)

## Updating OpenSSL ##

warning> OpenSSL should never be updated in a production enviroment.

OpenSSL is a fairly low level package on your system. Lots of things depend on it. If you are going to update it, you should update everything that depends on it. This would be akin to creating your own distro.

Most desire for this comes from [Third Party PCI Compliance](/linktoPCIwiki.md). As long as you are not on an EOL distro, security issues are backported.

info> If you are having PCI issues with OpenSSL vulnerabilities, please see the [Third Party PCI Compliance wiki](/linktoPCIwiki.md).

## Alternate Formats ##

#### `x.509` Format ####

#### `pem` Format ####

The `pem` format for an SSL is basically the same as an `x.509`, but with the CA Bundle and certificate and key all with one file. This is usually easier to configure.

info> A `.pem` file contains multiple `x.509` certs, and should go all the way back up to the root certificate.

All you have to do to create a `.pem` file from `x.509` is dump all the certificates into the file. There are a few items to keep in mind however:

* The chain needs to be complete - certificate to upstream CA all the way to the root
* The chain can start with the private key first, if it does not the server will have to be configured with the key file also.
* If the .pem file contains the private key, it should have ownership and be protected like a private key.
* Every key/cert in the .pem retains their heading and footer - the part that reads "-----BEGIN CERTIFICATE----- "
* There should be no blank lines

### Configuring Apache to use a .pem ###

To configure Apache to use a `.pem` file, use the directive `SSLCertificateFile`. The key is loaded with the directive `SSLCertificateKeyFile`.

info> For security reasons it is recomended that you put the key in a seperate file.

### Configuring Exim to use a .pem ###

It's much more common to use a `.pem` with Exim, or other mail servers. For instance, cPanel configures `exim` as such:

```nohighlight
tls_certificate = /etc/exim.crt
tls_privatekey = /etc/exim.key
tls_advertise_hosts = *
```

`/etc/exim.crt` is actually a .pem file, configured to go back up to root.

## Converting an .p7b SSL ##

To convert a ''filename''.p7b file, as some CS bundles arrive in, the commands are:

```bash
openssl pkcs7 -text -inform DER < NetSol_OV.p7b > NetSol_OV.pem
openssl pkcs7 -print_certs -inform PEM -in NetSol_OV.pem
```

## PKCS #12 Format ##

PKCS #12 is one of many encryption algorithms released by RSA laboratories. [http://en.wikipedia.org/wiki/PKCS12][http://en.wikipedia.org/wiki/PKCS] Files encrypted in this format are typically given the extension `.pk12`.

**Apache cannot use a PKCS #12 key.** PKCS #12 is a storage container format that you can pack keys into, and Apache cannot dig into that to pull out the keys.

When customers are asking for this, what they're actually asking you to do is create the key, CSR, cert, and pack the whole lot into a PKCS #12 encrypted file. You can do this with:

```bash
openssl pkcs12 -export -in name-cert.pem -inkey private/name-key.pem -certfile cacert.pem -name "[friendly name]" -out name-cert.p12
```
info> The PKCS #12 encryption step will request a password, this password will be needed to decrypt the file.

When you install this in your browser, you're installing the certificates into your browser, so that your server uses this certificate. PKCS #12 isn't during the `https` session, it's just used to pack everything into a file.
