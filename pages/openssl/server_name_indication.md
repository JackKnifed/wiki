topic: ssl
title: Server Name Indication

Server Name Indication
======================

## OpenSSL Encryption Techniques ##

OpenSSL can be used three ways:

* The socket connection is made through the OpenSSL library, encrypting the traffic thorugh the socket connection.
* The socket connection can be created within the application, then encryption later on started using StartTLS.
* Another proxy application can do the encryption (with the same options), and pass the requests off to the primary application, unencrypted.

When the connection is opened, encryption is started. However, in [2003](https://tools.ietf.org/html/rfc3546) a specification was first added for [Server Name Indication](https://tools.ietf.org/html/rfc6066) - or SNI. This gives clients a mechanism to initiate the SSL connection for a specific domain.

Your client, server, and SSL encryption library need to all support SNI for it to work, but it works well. With this, you can put multiple SSLs for different domain names on the same IP and port.

## Life with SNI ##

cPanel traditionally (`pre 11.38`) limited you to one SSL per account, and one IP per account, and one only one domain was used for that SSL. This is changing with time, as they are embracing SNI where possible.

In order to use SNI, you have to have:

* CentOS `6.0`+
* Default OpenSSL

If you have all of this, the methods listed below work.

warning> Do not upgrade OpenSSL to something other than the default. Ever.

### Multiple Sites with SSL on the same IP ###

Additional Requirements:

* Apache `2.2.12+`
* cPanel `11.38+`.

If you have that, just go install the SSLs as you want - cPanel will handle them just fine.

### Mail SNI on SSL install ###

Additional Requirements:

* cPanel `11.48.1+`
* Dovecot

When installing new SSLs, there's a checkbox enable this. Old SSLs were enabled as a part of the `upcp` to bring it to 11.48.

notice> The customer will *have* to connect to the server via `domain.tld` for whatever the certificate is issued for. `www.domain.tld` will not be configured.

If you have problems, check for the following line in `/var/cpanel/userdata/$user/$domain.tld_SSL`:

```nohighlight
enable_sni_for_mail: 1
```

Once that is there, you can use the script `/scripts/build_main_sni` to rebuild everything else needed.

Related files:

* `/etc/mail_sni_map`
* `/etc/dovecot/sni.conf`

## Life without SNI ##

If you don't have SNI, your server will attempt to open the SSL connection with the first SSL configured. If your first SSL is valid for all of the domains that sit on that IP, this can work.

### Additional domains with SANs ###

A SAN allows you to put additional domains or subdomains onto an SSL. So, the plan is to just add additional domains and subdomains to that SSL until it coveres everything on that IP, then install it for each domain (just to be clean).

### Adding SANs to existing certificates ###

SANs (including additional domains for Organizational and EV Certs) can be added to an existing certificate by clicking on "Change SAN Option" within GlobalSign. [Further information, including screenshots can be found here](https://support.globalsign.com/customer/portal/articles/1216409-adding-additional-sans---multi-domain-ssl).

### Wildcard VHOST installation ###

notice> This only works for one docroot - one set of files to serve

If you want all subdomains of a specific domain to resolve to the same vhost - the same docroot - this is possible. All subdomains of the domain will be parked on the main domain.

You first have to create the DNS record for `*.domain.tld`, where `domain.tld` is the domain.

Next, within their cPanel install, add a Parked domain as `*.domain.tld`.

Finaly, since they likely want https, get a wildcard SSL, then install it on `*.domain.tld`.

### Using a subdomain, addon domain, or vhost on another IP ###

You can change the IP address of any VirtualHost in Apache.

Every VirtualHost in Apache has a configuration file in `/var/cpanel/userdata/username/domain.tld` where:

* `username` is the cPanel username the domain is under
* `domain.tld` is the URL for the domain

There is also a second file contaiing SSL configuration options at `/var/cpanel/userdata/username/domain.tld_SSL` - inheriting everything from the standard configuration.

If you have an addon domain that you want to place on a different IP, you can simply edit the following line in both of the configuration files:

```nohighlight
ip: 50.28.28.38
```

Once you've done that, you have to run a script to update some cache:

```bash
/usr/local/cpanel/bin/updateuserdatacache
```

Then rebuild the Apache conf 

```bash
/usr/local/cpanel/scripts/rebuild_httpd_conf
```

Finally, make sure you update DNS to point at the new IP address, and verify the site works and you are done.