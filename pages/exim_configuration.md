author: jack
topic: exim
topic: cpanel
title: Exim Configuration

Exim Configuration
==================

Smart Routes
------------

This bit will add a default Smart Route (send all email through a third party Spam relay).

In /etc/exim.conf.local under the `ROUTERSTART` section add and adjust the following:

```
smart_route:
	driver = manualroute
	domains = !+local_domains
	transport = remote_smtp
	route_list = * saferoute.coburnenterprises.com::587
```

To add a smart route for specific domains, add and adjust the following under the `ROUTERSTART`.
This bit needs to go before the previous bit:

```
securence_route:
    driver = manualroute
    domains = !+local_domains
    condition = ${lookup{$sender_address_domain}lsearch{/etc/securence_domains}{1}}
    transport = remote_smtp
    route_list = * smarthost.securence.com
```

You then also need to create the file `/etc/securence_domains` (or similar, as adjusted).
In that file you need to list all domains that you want to be routed through that destination.

You will likely also have to write your own transport for the `hosts_require_tls` setting - if the customer wants that.
Authentication likely also goes in the transport. An example transport is below:

```
securence_smtp:
  driver = smtp
  hosts_require_tls = smarthost.securence.com
  interface = <; ${if exists {/etc/mailips}{${lookup{$sender_address_domain}lsearch{/etc/mailips}{$value}{${lookup{$sender_address_domain}lsearch{/etc/mailips}{$value}{${lookup{${perl{get_sender_from_uid}}}lsearch*{/etc/mailips}{$value}{}}}}}}}}
  helo_data = ${if exists {/etc/mailhelo}{${lookup{$sender_address_domain}lsearch{/etc/mailhelo}{$value}{${lookup{$sender_address_domain}lsearch{/etc/mailhelo}{$value}{${lookup{${perl{get_sender_from_uid}}}lsearch*{/etc/mailhelo}{$value}{$primary_hostname}}}}}}}{$primary_hostname}}
```

IDK tbh I mostly shitpost anyway.
