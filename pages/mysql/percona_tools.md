topic: mysql
author: jack
title: Percona Toolkit

Percona Toolkit
---------------

RedHat Installation
-------------------

ok> [Pulled from this page](https://www.percona.com/doc/percona-xtradb-cluster/5.5/installation/yum_repo.html)

```bash
yum install http://www.percona.com/downloads/percona-release/redhat/0.1-3/percona-release-0.1-3.noarch.rpm
```

If you are on CentOS 5, instead:

```bash
pushd /usr/local/src
wget http://www.percona.com/downloads/percona-release/redhat/0.1-3/percona-release-0.1-3.noarch.rpm
yum install percona-release-0.1-3.noarch.rpm
popd
```

Disable the Repository

```bash
sed -i 's/enabled\s*=\s*1/enabled=0/g' /etc/yum.repos.d/percona-release.repo
```

Install the Toolkit

```bash
yum install --enablerepo=percona-release-noarch percona-toolkit
```

If this does not automatically install the required dependencies, you need to resolve this by hand.


Debian Installation
-------------------

ok> [Pulled from this page](https://www.percona.com/doc/percona-server/5.5/installation/apt_repo.html)

```bash
wget https://repo.percona.com/apt/percona-release_0.1-3.$(lsb_release -sc)_all.deb
```

```bash
dpkg -i percona-release_0.1-3.$(lsb_release -sc)_all.deb
```

Downgrade the priority on the repository

```bash
echo <<EOM >> /etc/apt/preferences.d/percona.pref
Package: *
Pin: release o=Percona Development Team
Pin-Priority: 400
EOM
```

```bash
apt-get update
apt-get install percona-toolkit
```

pt-query-digest
---------------

[Documentation is here](https://www.percona.com/doc/percona-toolkit/2.2/pt-query-digest.html)

Run it like:

```bash
mysql -Bse 'show variables like "slow_query_log";'|awk '{print $2}'|xargs -I{} pt-query-digest- -progress time,5 {} --output /home/lwtemp/digest.$(datedate +%F.%T%z)
```

The report that is output consists of three sections:

* Overall statistical summary
* Query Listing (by query hash)
* Query Breakdowns (one for each query)

The first two sections are not covered here.

```text
 Query 1: 0.26 QPS, 0.00x concurrency, ID 0x92F3B1B361FB0E5B at byte 14081299
 This item is included in the report because it matches --limit.
 Scores: Apdex = 1.00 [1.0], V/M = 0.00
 Query_time sparkline: |   _^   |
 Time range: 2011-12-28 18:42:47 to 19:03:10
 Attribute    pct   total     min     max     avg     95%  stddev  median
 ============ === ======= ======= ======= ======= ======= ======= =======
 Count          1     312
 Exec time     50      4s     5ms    25ms    13ms    20ms     4ms    12ms
 Lock time      3    32ms    43us   163us   103us   131us    19us    98us
 Rows sent     59  62.41k     203     231  204.82  202.40    3.99  202.40
 Rows examine  13  73.63k     238     296  241.67  246.02   10.15  234.30
 Rows affecte   0       0       0       0       0       0       0       0
 Rows read     59  62.41k     203     231  204.82  202.40    3.99  202.40
 Bytes sent    53  24.85M  46.52k  84.36k  81.56k  83.83k   7.31k  79.83k
 Merge passes   0       0       0       0       0       0       0       0
 Tmp tables     0       0       0       0       0       0       0       0
 Tmp disk tbl   0       0       0       0       0       0       0       0
 Tmp tbl size   0       0       0       0       0       0       0       0
 Query size     0  21.63k      71      71      71      71       0      71
 InnoDB:
 IO r bytes     0       0       0       0       0       0       0       0
 IO r ops       0       0       0       0       0       0       0       0
 IO r wait      0       0       0       0       0       0       0       0
 pages distin  40  11.77k      34      44   38.62   38.53    1.87   38.53
 queue wait     0       0       0       0       0       0       0       0
 rec lock wai   0       0       0       0       0       0       0       0
 Boolean:
 Full scan    100% yes,   0% no
 String:
 Databases    wp_blog_one (264/84%), wp_blog_tw… (36/11%)... 1 more
 Hosts
 InnoDB trxID 86B40B (1/0%), 86B430 (1/0%), 86B44A (1/0%)... 309 more
 Last errno   0
 Users        wp_blog_one (264/84%), wp_blog_two (36/11%)... 1 more
 Query_time distribution
   1us
  10us
 100us
   1ms  #################
  10ms  ################################################################
 100ms
    1s
  10s+
 Tables
    SHOW TABLE STATUS FROM `wp_blog_one ` LIKE 'wp_options'\G
    SHOW CREATE TABLE `wp_blog_one `.`wp_options`\G
 EXPLAIN /*!50100 PARTITIONS*/
SELECT option_name, option_value FROM wp_options WHERE autoload = 'yes'\G
```

This section is printed for each line. You get a breakdown of the time required for the query. The breakdown depends on your MySQL server.

pt-online-schema-change
-----------------------

[Modify the schema of an InnoDB table](https://www.percona.com/doc/percona-toolkit/2.2/pt-online-schema-change.html) without locking the table.

Rewrite your `ALTER TABLE` statement

```mysql
ALTER TABLE database.table ADD COLUMN c1 INT
```

```bash
pt-online-schema-change --alter "ADD COLUMN c1 INT" D=database,T=table
```

pt-duplicate-key-checker
------------------------

[Find redudant/duplicate keys](https://www.percona.com/doc/percona-toolkit/2.2/pt-duplicate-key-checker.html).

```bash
pt-duplicate-key-checker
```

pt-diskstats
------------

[A cooler version](https://www.percona.com/doc/percona-toolkit/2.2/pt-diskstats.html) of `iostat`.

```bash
pt-diskstats --devices-regex=sd --interval=2
```

pt-kill
-------

[A better option for cleaning up clogged MySQL queries](https://www.percona.com/doc/percona-toolkit/2.2/pt-kill.html).

info> When you want this to actually kill, change `--print` to `--kill`.

```bash
pt-kill --ignore-user root --busy-time 60 --print
```

```bash
pt-kill --ignore-user root --print
```

pt-ioprofile
------------

[An IO profiler for the system - to watch what's writing to the disk](https://www.percona.com/doc/percona-toolkit/2.2/pt-ioprofile.html).

```bash
pt-ioprofile
```

pt-mysql-summary
----------------

A good replacement for `mysql-tuner`.

```bash
pt-mysql-summary
```

pt-summary
----------

[A system summary tool](https://www.percona.com/doc/percona-toolkit/2.2/pt-summary.html).

```bash
pt-summary
```

pt-stalk
--------

[Watches MySQL, monitoring statistics actively](https://www.percona.com/doc/percona-toolkit/2.2/pt-stalk.html).

```bash
pt-stalk
```

pt-variable-advisor
-------------------

[Looks for bad variables](https://www.percona.com/doc/percona-toolkit/2.2/pt-variable-advisor.html).

```bash
pt-variable-advisor localhost
```

pt-table-checksum
-----------------

[Verify the contents tables of the master vs a slave in replication](https://www.percona.com/doc/percona-toolkit/2.2/pt-table-checksum.html). Run this one on the master.

```bash
pt-table-checksum
```

pt-table-sync
-------------

[The complement to pt-table-checksum, this corrects differences](https://www.percona.com/doc/percona-toolkit/2.2/pt-table-sync.html).

Sync all tables on `host1` to `host2` and `host3`.

```bash
pt-table-sync --execute host1 host2 host3
```

```bash
pt-table-sync --execute --sync-to-master slaves
```


