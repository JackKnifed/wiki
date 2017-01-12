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
exim -bt address@domain.com
```

Remove frozen messages from queue
```bash
exiqgrep -z -i | xargs exim -Mrm
```

Thaw all frozen messages and attempt delivery
```bash
exiqgrep -z -i|xargs exim -Mt
exim -q -v
```

Count `cwd=` lines in `exim_mainlog`
```bash
awk '$4 ~ /^cwd=/ {gsub('/cwd=/', "", $4); print $4}' /var/log/exim_mainlog|sort|uniq -c|sort
```

Print a summary of the messages in the queue
```bash
exim -bp|exiqsumm
```

Exim Flags
--------

#### Debug information

Test Delivery to Address (internal or external)
```bash
root@localhost# exim -bt alias@localdomain.com
user@thishost.com
    <-- alias@localdomain.com
  router = localuser, transport = local_delivery
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