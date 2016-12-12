topic: ssl
topic: PCI
topic: cpanel
topic: plesk
topic: core managed
title: SSL Cipher Testing

Listing SSL Ciphers
===================

Nmap's `ssl-enum-ciphers` script can be used to produce a list of the supported cipher suites in the following way:

warning> `nmap` will give a strength rating for each supported cipher suite. Don't trust them.

```bash
nmap --script ssl-enum-ciphers -p 443 example.com
```

```nohighlight
$~  nmap --script ssl-enum-ciphers -p 443 liquidweb.com

Starting Nmap 6.00 ( http://nmap.org ) at 2015-06-25 21:15 EDT
Nmap scan report for liquidweb.com (209.59.159.10)
Host is up (0.0017s latency).
PORT    STATE SERVICE
443/tcp open  https
| ssl-enum-ciphers: 
|   TLSv1.0
|     Ciphers (3)
|       TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_DHE_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_RSA_WITH_RC4_128_SHA - strong
|     Compressors (1)
|       NULL
|_  Least strength = unknown strength

Nmap done: 1 IP address (1 host up) scanned in 5.40 seconds
```

```nohighlight
$ nmap --script ssl-enum-ciphers -p 443 google.com   

Starting Nmap 6.00 ( http://nmap.org ) at 2015-06-25 21:44 EDT
Nmap scan report for google.com (216.58.216.238)
Host is up (0.0070s latency).
rDNS record for 216.58.216.238: ord31s22-in-f14.1e100.net
PORT    STATE SERVICE
443/tcp open  https
| ssl-enum-ciphers: 
|   SSLv3
|     Ciphers (9)
|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong
|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_RSA_WITH_RC4_128_MD5 - unknown strength
|       TLS_RSA_WITH_RC4_128_SHA - strong
|     Compressors (1)
|       NULL
|   TLSv1.0
|     Ciphers (9)
|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong
|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_RSA_WITH_RC4_128_MD5 - unknown strength
|       TLS_RSA_WITH_RC4_128_SHA - strong
|     Compressors (1)
|       NULL
|   TLSv1.1
|     Ciphers (9)
|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong
|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_RSA_WITH_RC4_128_MD5 - unknown strength
|       TLS_RSA_WITH_RC4_128_SHA - strong
|     Compressors (1)
|       NULL
|   TLSv1.2
|     Ciphers (17)
|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 - strong
|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 - strong
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 - unknown strength
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 - unknown strength
|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong
|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
|       TLS_RSA_WITH_AES_128_CBC_SHA - strong
|       TLS_RSA_WITH_AES_128_CBC_SHA256 - strong
|       TLS_RSA_WITH_AES_128_GCM_SHA256 - strong
|       TLS_RSA_WITH_AES_256_CBC_SHA - unknown strength
|       TLS_RSA_WITH_AES_256_CBC_SHA256 - unknown strength
|       TLS_RSA_WITH_AES_256_GCM_SHA384 - unknown strength
|       TLS_RSA_WITH_RC4_128_MD5 - unknown strength
|       TLS_RSA_WITH_RC4_128_SHA - strong
|     Compressors (1)
|       NULL
|_  Least strength = unknown strength

Nmap done: 1 IP address (1 host up) scanned in 12.90 seconds
```
