author: jack
topic: exim
topic: cpanel
title: exim

Exim Basics
===========

There are three portions to Exim:

* The outgoing queue, which you can run direct Exim commands against
* `exiqgrep` which makes some parts of querying the outgoing queue easier
* The logs - pulled apart with grep, awk, and cut

If you want to read a message that has been delivered, you cannot get that from Exim. That already passed Exim.

Messages in the outgoing queue are either frozen, or thawed. If they are thawed, the next queue run will attempt to delivery that message. If they are frozen, they will thaw at the next given retry time.

Exim CheatNotes
---------------

Delivery Test
```bash
root@localhost# exim -bt alias@localdomain.com
user@thishost.com
    <-- alias@localdomain.com
  router = localuser, transport = local_delivery
```



Exim Flags
--------

#### Debug information

Test Delivery to Address (internal or external)
```bash
exim -bt
```

Test Receipt from a given IP
```bash
exim -bh 192.168.1.1
```

#### Queue Management
Count Outgoing Messages
```bash
exim -bpc
```

List Outgoing messages
```bash
exim -bp
```

Run Queue
```bash
exim -q
```

#### Actions for Queued Messages
Print Header
```bash
exim -Mvh <message id>
```

Print Body
```bash
exim -Mvb <message id>
```

Print Logs
```bash
exim -Mvl <message id>
```

Thaw Message
```bash
exim -Mt <message id>
```

Freeze message
```bash
exim -Mf <message id>
```

Delete Message
```bash
exim -Mrm <message id>
```

exiqgrep
--------

`exiqgrep` is a utility shipped with Exim.
It is used to display information about the Exim outgoing message queue.

#### exiqgrep Filtering

The following flags restrict messages by the given conditions.

Specific sender user/domain:
```bash
exiqgrep -f [user]@domain.com
```

Specific recipient user/domain:
```bash
exiqgrep -r [user]@domain.com
```

Messages older than 3600 seconds - 1 hour
```bash
exiqgrep -o 3600
```

Messages newer than 3600 seconds - 1 hour
```bash
exiqgrep -y 3600
```

Messages with the given size (regex match)
```bash
exiqgrep -s ^14.5$
```

Frozen messages
```bash
exiqgrep -z
```

Thawed messages
```bash
exiqgrep -z
```

#### exiqgrep output

Nominal output looks like the following

```bash
```

To just print the message IDs:
```bash
exiqgrep -i
```

Count the messages that meet the filters instead of printing results

```bash
exiqgrep -c
```


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
Authentication likely also goes in the transport.

