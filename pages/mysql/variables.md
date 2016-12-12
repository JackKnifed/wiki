author: jack
topic: mysql
title: MySQL Variables

MySQL Variable Reference
========================

note> MySQL has good defaults. You should only be setting `innodb_buffer_pool_size` and `key_buffer_size`.

note> Some variables may be modified with `SET GLOBAL VARIABLE_NAME := value;`. Others, as noted, require a restart.

note> Authoritative upstream source [is here](https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html)

### `pid_file` ###
The pid file for MySQL is created at this location. Requires a restart.

Default is `$datadir/$hostname.pid`

### `port` ###
MySQL port.

Default is `3306`. Requires a restart.

### `bind_address` ###
Specifies the address to listen on.

Default is `0.0.0.0`. Requires a restart.

### `datadir` ###
Specifies the location of the MySQL datadir. Many other location variables are based on this. It is recommend that you leave this at default, and replace that directory with a symlink to move the datadir.

Default is `/var/lib/mysql`. Requires a restart.

### `read_only` ###
Enabling this blocks all queries that would modify data.

### `tmpdir` ###
Tempoary tables are placed in this directory.

Default is `/tmp`. Requires a restart.

### `lower_case_table_names` ###
Set this to emulate a case-insensitve filesystem (like Windows). With this, `a` and `A` are the same character in all database and table names.

### `max_connections` ###
Maximum number of user connections to MySQL.
note> There is always a +1 superuser only connection.

### `max_user_connections` ###
Similar to `max_connections`, this is a limit on the number of connections from one specific `user@location`.

### `time_zone` ###
MySQL time zone, if set to SYSTEM (or unset) time zone is inherited on MySQL startup.

### `version` ###
MySQL server version, hard coded. `mysql -V` actually reports the client version, not the server version.

## MyISAM specific ##
### `key_buffer_size` ###
Max size of cache for MyISAM engine indexes. Only indexes can be cached in MyISAM. Should be set to the total size of `.MYI` files, as memory permits.

### `concurrent_insert` ###
With this enabled, inserts to the MyISAM engine are done concurrently when they can be. Similar to `delayed_insert`, but with threading.

### `delayed_insert` ###
Because MyISAM requires locking the table on insertion, `delayed_insert` allows `INSERT` statements to be saved, and run together for less impact.

* `delayed_insert_limit` sets the max number of inserts to run at once before checking for other non-insert queries.
* `delayed_insert_timeout` sets the max time to wait for more inserts.
* `delayed_queue_size` sets the max size of the insert queue.
* `low_priority_update` sets `UPDATE` statements to be treated like `INSERT DELAYED`.

## InnoDB specific ##
### `innodb_buffer_pool_size` ###
The amount of memory to allocate to InnoDB for caching data and indexes. Should be set up to the size of the active InnoDB pages in data files, as memory permits.

### `innodb_file_per_table` ###
Disabled, MySQL creates all new tables in `ibdata1`.
Enabled, MySQL creates the system table indexes in `idbata1`, but puts the pages for the table in a `.ibd` file.
warning> Changing this requires recreating the datadir. **There can be no data in MySQL**.

### `innodb_log_file_size` ###
Controls the size of the `ib_logfile0` and `ib_logfile1`. MySQL 5.6.8+ should automatically expand the files if they are smalller than this configured size. MySQL 5.6.7 and earlier will fail to start if this is misconfigured.

note> If MySQL fails to start because of this specific issue, remove the files. MySQL will create new ones on startup. This is fairly safe, but only truly 100% safe when there is no data in InnoDB.

## timeouts ##
* `interactive_timeout` is the max time to wait on a running query to finish.
* `wait_timeout` is the maximum time to wait idle in the middle of a query.
* `net_connect_timeout` is the maximum time to wait for authentication and query receipt before cancellation.
* `table_lock_timeout` is the maximum time to wait on a table lock before cancelling a query.

## slow query log ##

MySQL will log all queries that take over a specified time.

* `slow_query_log` enables or disables the log - only needed on MySQL 5.1 or higher
* `slow_query_log_file` sets the file to output to
* `long_query_time` log queries longer than this number of seconds
* `log_slow_rate_limit` if Percona, only log each `log_slow_rate_limit`-th query

## query_cache ##
MySQL will cache complete results for read-only queries in the `query_cache`. This cache is not sorted, indexed, or hashed - a full cache scan happens for every query. This makes this highly inefficient.

* `query_cache_size` can be used to define the size of a `query_cache` to allow.
* `query_cache_limit` sets the largest entry that can go into the `query_cache`.
* `query_cache_type` defines the type of query cache - `GLOBAL` or `SESSION`. It may also be set to `OFF` to disable the `query_cache`.
* `query_cache_wlock_invalidate` causes any `WRITE LOCK` to any table to also lock any `query_cache` entries for that table.

Only recommendation is `query_cache_type` set to `OFF`. Requires a restart.

## replication ##

The master binlog is logs every change on the local server, and the origin.
* `binlog_format` - type of binary logging to do - statement based, or byte changes.
* `bin_log` - name of the master log (on the master).
* `log_bin_index` - place to store the current offset into the binlog.
* `max_binlog_size` - maximum size of the binlog.
* `expire_logs_days` - number of days to retain binlogs.
* `server-id` defines the numerical id of the server - should be unique across the cluster

The slave relay log is retrieved from a upstream master by the slave, and applied to the slave.
* `relay_log` - name of the relay log (on the slave)
* `relay_log_index` - place to store the current offset into the relay log.
* `max_relay_log_size` - maximum size of the relay log.
* `relay_log-purge` - by setting to off, relay logs will not be removed after used.
* `relay_log_space_limit` - max space to use for relay logs.
* `read_only` - will block changes on the server, but replication proceeds

## per-thread allocations ##
All settings here either are per connection, or per join within a query (or similar).

warning> It is advisible to keep these settings low. Setting them too high will mean dropping `mmap()` for `malloc()` within MySQL, resulting in degraded preformance.

* `join_buffer_size` allocates a buffer, per join, for joining rows. If the join is to large to fit in the buffer, it happens in `tmpdir`. Keep under `4M`.
* `sort_buffer_size` allocates a buffer, per sort, for sorting rows. If the sort is too large, it is done in a tempoary table. Keep under `4M`.
* `max_allowed_packet` is the limit on the size of a query. Large queries should be avoided as they will bog MySQL down. `64M` should be plenty, but this can be raised for imports.

## auto_increment settings ##
Both of these settings can be overridden on the table level.

* `auto_increment_increment` is the value to increase `auto_increment` for each row.
* `auto_increment_offset` is the starting point for the `auto_increment`.

## sql_mode ##
Defines behavior of MySQL. Better explanation [is here](http://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)

* `NO_ENGINE_SUBSTITUTION` disallows MySQL engine substitution on table creation (if an engine is missing).
* `STRICT_TRANS_TABLES` disallows inserting empty strings/values into tables - `NULL` should be used instead. Many applications are not written properly, and require this to be disabled.note> Often set in `/usr/my.cnf`

note> Often set in `/usr/my.cnf`
