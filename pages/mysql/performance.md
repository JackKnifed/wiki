topic: mysql
topic: performance
author: jack
title: MySQL Performance

MySQL Performance
=================

There's a few general steps to getting the proper performance from MySQL. The big things to hit:

* Optimize any fragmented tables
* Set `innodb_buffer_pool_size`
* Set `key_buffer_size`
* For `tmpdir` heavy loads, put `tmpdir` in `/dev/shm`
* Consider hardware configuration
* Profile the problems

Table Optimization
------------------

Run a `mysqlcheck` to see if the tables report as fragmented.

```bash
mysqlcheck -Asc
```

Any tables that report as fragmented should be optimized, anything else is a waste.

```bash
mysqlcheck -or database table
```

MySQL Configuration
-------------------

Run the following command:

```bash
mysql -Bse 'show variables like "datadir";'|awk '{print $2}'|xargs -I{} find {} -type f -printf "%s %f\n"|awk -F'[ ,.]' '{print $1, $NF}'|awk '{array[$2]+=$1} END {for (i in array) {printf("%-15s %s\n", sprintf("%.3f MB", array[i]/1048576), i)}}'
```

* Set `innodb_buffer_pool_size` according to `ibdata` plus `ibd`
* Set `key_buffer_size` according to `MYI`

ok> Remember, `innodb_buffer_pool_size` caches hot InnoDB pages. `key_buffer_size` only caches MyISAM indexes.

Disable `query_cache`
---------------------

The `query_cache` in MySQL is trash because of how it's written. Set the following two settings in the `my.cnf` and reboot MySQL:

```
query_cache_size = 0
query_cache_type = 0
```

Putting `tmpdir` in `/dev/shm`
------------------------------

For a heavy IO MySQL load, if you're doing a lot of `FileSort` in queries, you can change the tmpdir to ram to make things go faster.

Set the following:

```text
tmpdir=/dev/shm
```

If they run out of RAM, they are out of `tmpdir` with this, but it will go faster.

Verify Proper Hardware Configuration
------------------------------------

If you are building a dedicated database server, you can build the server dedicated to databases.

* Logs are read and written sequentially. You can easily put them on spinning media (it may be faster).
* Data pages are read and written randomly. You should put them on high performance, solid state disks.
* RAM is cheap compared to the time it can save you. Throw 64GB+ in there and ramdisk up the `tmpdir`.

You can put your logs and data files in different locations with your MySQL configuration to gain performance.

Raid controllers are cheaper than the time that you'll lose from not having them.

Raid controller write caching is great, but without a monitored and known good BBU the risk of data lose is more expensive.

CPU's are great, but CPU contention is rarely the bottleneck you will hit.

In order, assuming you tune performance right, bottlenecks in order will be:

* Disk IO
* RAM
* Network
* CPU

Profile the Problems
--------------------

* Turn on the slow query log
* Run that log through `pt-query-digest` and see what hurts
* Find a way to make it not hurt

You should [enable the Slow Query Log](/mysql/commands#Enable a Slow Query Log). If you're on Percona, include the `log_slow_rate_limit`.

```text
slow_query_log = 1
slow_query_log_file = /var/lib/mysql/slow.log
long_query_time = 1
# log_slow_rate_limit = 5
```

* Set up rotation on that log too, and rotate it once a week.
* Run that log through `pt-query-digest` - once a week, hang that hit list on your wall.
* Look at the `EXPLAIN` and `CREATE TABLE` for everything on that list - understand how it works.
* Fix the targets, top to bottom.
* Over time, work `long_query_time` down to your target. All queries under `1/10th` second is a good start, go lower as needed.

How Indexes Work
----------------

Remember what an index is - the database is like a library, the index is like the little index cards.

* The full row is on the table, and there may be data that you have to go to the table to get.
* The rows on the table are arranged 
* There are index cards, one set sorted by author name, the other book title, both with the location of the book recorded.
* When you need to find a given book, you find the index card based on what you have, and that gives you some information about it
* You go retrieve the book if you need it.

Continous vs Discrete
---------------------

* A real number line is continuous
 * There are an unknown number of values between any two points
 * If you look between `1` and `3`, there are an infinite number of values
* An integer number line is discrete
 * There are a known number of values between any two points
 * If you look between `1` and `3`, there is only one value - `2`

These same distinctions apply to MySQL matching

* A constant assertion in a `WHERE` clause is discrete
 * `col1 = 1`
 * `col1 <> 1`
 * `col1 IN (1, 2, 3, 4)`
 * `col2 = "ABC"`
* A range assertion in a `WHERE` clauses is be continuous
 * `col 1 > 0`
 * `col1 < 15`
 * `col1 BETWEEN 10 AND 20`
 * `date1 BETWEEN 2000-01-01 AND 2008-01-01`
 * `string1 LIKE "ABC%"`

How MySQL uses Indexes
----------------------

MySQL uses Indexes as much as it can.

* Keeep in mind the order of query execution - that is the index usage order.
* MySQL can use one index to sort each table, as it processes through that table.
* When MySQL does a lookup against the next table, it can use the next index.
* As soon as MySQL cannot filter a column, it cannot use that index any further.
* Once rows are determined for the query, MySQL may use already used indexes for `GROUP`/`ORDER` clauses
* MySQL cannot use an index beyond a continuous/range assertion
 * If you have a `BETWEEN` sub clause, MySQL cannot use an index past that

With all of these points in mind, you want to design your indexes to play into the query and these rules.

`FULLTEXT` Indexes
------------------

info> `FULLTEXT` indexes are only available in MyISAM, and InnoDB 5.6+

A normal index takes a given column, sorts it, and stores the sorted version.

A `FULLTEXT` breaks up a given string into `words`, and creates a link back to that row for every word in the column.

As a result, you can check a word against the `FULLTEXT` index, and see what rows it is in.

`FULLTEXT` indexes are usually stored in a hash format (instead of binary tree) so it's faster lookups.

With all of that in mind, they're used when they can be used - just like regular indexes.
