author: jack
topic: cpanel
title: chkservd

ChkServ.d
=========

`chkservd` is a process within `tailwatchd`. cPanel uses this to make sure things stay running.

Parsing
-------

If you want a script to parse chkserv logs, you can use the following.

```perl
#!/usr/bin/env perl

my $timestamp;
while (<>) {

	# grab the current line and throw it in a variable
	my $line = $_;


	# if the line starts with a timestamp, store it and strip it
	if ($line =~ /^(\[20\d\d-\d\d-\d\d \d\d:\d\d:\d\d .\d\d\d\d\])/) {
		$timestamp=$1;
		$line = substr($line, length($timestamp));
	}

	# skip junk lines
	if ($line !~ /^\s*(Service check|Disk check)/) {
		next;
	}

	# split the rest of the line into chunks, then print each chunk with the timestamp.
	@chunks = split(/\.\.\./, $line);
	foreach my $part (@chunks) {
		print $timestamp . ' ' . $part . "\n";
	}
}
```

Documentation
-------------

There are two major formats to do chkservd scripts - through TCP challenge/response, or pid check.

Challenge/response format:

```text
service[SERVICE]=PORT,SEND,RESPONSE,RE-START COMMAND,SERVICE,USER
```

The pid check format:

```text
service[SERVICE]=x,x,x,RE-START COMMAND,SERVICE,USER
```

Don't forget to enable services in  `/etc/chkserv.d/chkservd.conf`

No matter what, cPanel simply runs `/usr/local/cpanel/scripts/restartsrv_[name]` based on the name of the script.

Memcached
---------

The following chkservd script for memcached works well:

```text
service[memcached]=11211,version,VERSION,/etc/init.d/memcached restart,memcached,memcached
```

You also have to add the init script at `/scripts/restartsrv_memcached`.

ok> CentOS 5 and 6

```bash
echo << EOM > /scripts/restartsrv_memcached
#!/bin/bash
/etc/init.d/memcached restart
EOM
chmod +x /scripts/restartsrv_memcached
```

ok> CentOS 7

```bash
echo << EOM > /scripts/restartsrv_memcached
#!/bin/bash
/bin/systemctl restart memcached
EOM
chmod +x /scripts/restartsrv_memcached
```


ElasticSearch
-------------

Assuming ElasticSearch can be checked with `curl localhost:9300` the following works for `ElasticSearch`.

```text
service[elasticsearch]=9300,GET / HTTP/1.1
User-Agent: curl/7.38.0
Host: 127.0.0.1:9200
Accept: */*,{
  "status" : 2..,/etc/init.d/elasticsearch restart
```


```bash
echo << EOM > /scripts/restartsrv_elasticsearch
#!/bin/bash
/etc/init.d/elasticsearch restart
EOM
chmod +x /scripts/restartsrv_elasticsearch
```

```bash
echo << EOM > /scripts/restartsrv_elasticsearch
#!/bin/bash
/bin/systemctl restart elasticsearch
EOM
chmod +x /scripts/restartsrv_elasticsearch
```
