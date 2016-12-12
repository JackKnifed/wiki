topic: ssl
title: CentOS 4.7 SSL Installation

CentOS 4.7 SSL Installation
===========================

Generating Keys on CentOS 4.7
-----------------------------

You *should* be able to generate the key and CSR through cPanel. You need to make sure it is a `4096 bit` key. If you cannot, the commands to do so are listed below - you might have to change directories, depending:

```bash
openssl genrsa -out /etc/ss/private/domain.com.key 4096
openssl req -new -nodes -key /etc/ssl/private/domain.com.key -out /etc/ssl/csr/domain.com.csr
cat /etc/ssl/csr/domain.com.csr
```

Installing an SSL on CentOS 4
-----------------------------

cPanel validates an SSL before installing it. This creates a problem as on Cent4 the root certificate package is out of date. Thus, every SSL you install will fail validation - the root CA certificate that it was signed with is no longer on that server.

It is possible to update the root CA certificates package on the server - by manually modifing the file and updating it. The package will fail validation - for this and many other smaller reasons, we want to avoid doing this.

Instead, on these servers we need to manually rewrite the `/var/cpanel/userdata/user/domain.com_SSL` file to configure the SSL.

Of course, the SSL should first be put in `/usr/share/ssl/cert/` as appropiate, the CA bundle placed in the same place, the key and the CSR also, and then everything needs to be configured.

`SHA256` will work just fine - the version of OpenSSL installed on CentOS 4 includes support for `SHA256`.