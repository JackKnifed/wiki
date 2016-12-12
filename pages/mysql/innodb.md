topic: mysql
topic: training
author: jack
title: InnoDB Internals

InnoDB Internals
================

What it is
----------

InnoDB is a storage engine for MySQL. It boasts row-level locking which can immediately solve table locking issues on busy servers. It is the default storage engine as of MySQL 5.5 due to the performance benefits but has a unique set of issues you may encounter compared to the older MyISAM engine. InnoDB does not support `FULLTEXT` indexes before MySQL 5.6.
 
You can check if it is currently working by looking at the engines status:

```mysql
show engines;
```

To create an InnoDB table, just append the table type to the end of your create statement:

```mysql
CREATE TABLE example_innodb ( id INT, data VARCHAR(100)) ENGINE=InnoDB;
```

Or to convert a table to the InnoDB engine, simply alter the engine:

```mysql
ALTER TABLE example_table ENGINE=InnoDB;
```

It has the following default, database wide files, put in the datadir:

* `ibdata` the internal tablespace
* `ib_logfile0` a transactional log file
* `ib_logfile1` a redundant transactional log file with an offset

There is also a `.frm` for each table, and possibly a `.ibd` (depending on configuration). These are both in the folder for the relevant database.

info> `innodb_file_per_table` makes sysres happy

Enable/Disable InnoDB
---------------------

You can find if InnoDB is enabled/disabled/not installed by running `show engines;` in the MySQL CLI. This does not mean it is in use.

In MySQL 5.0+, InnoDB is a plugin to MySQL, and enabled by default. In MySQL 5.5+ InnoDB is the default engine for new tables in MySQL.

If InnoDB is present but disabled, something has disabled it.

* `skip-innodb` under the `[mysqld]` section of `my.cnf`
* Log file size does not match configured value
* InnoDB table corruption can disable the engine without crashing MySQL

InnoDB Internals
----------------

InnoDB stores everything as indexes. Those indexes are split into numbered 16K pages. If a page is needed, it is loaded into memory. Pages are always changed in the buffer pool, then are flushed to disk.

### `ib_logfile` ###

`ib_logfile0` and `ib_logfile1` are the internal log files (just two by default). They track the Log Sequence Number, or `LSN`. The `LSN` is incremented when:

* A transaction completes, modifying a page in the buffer pool
* A page is flushed to the disk
* The log is flushed to disk

The log lives in memory, and is only flushed to disk in intervals.

Every time a page is flushed to the disk, the current LSN stamped on the page.

#### `ib_logfile` mismatch ####

If MySQL refuses to start because the `ib_logfile` is the wrong size, just change the configured size of the `ib_logfile`.

### Change Buffer ###

MySQL 5.6 includes a change buffer - every time a row changes, that change is recorded in an internal buffer used to track just that.

When a query scans data, it also scans the change buffer to see if that data has recently been changed. If it has, it cheats.

### Crash recovery ###

After crashes, InnoDB recovers by running internal change buffers and log file to repeat changes since the last checkpoint. Most of the time this recovers cleanly.

Because of the complexity of InnoDB, `mysqlcheck -r` on a InnoDB table does nothing.

### `ibdata` ###

`ibdata1` is MySQL's primary tablespace, also known as the internal tablespace. By default, MySQL puts the 16K pages here.

### `innodb_file_per_table` ###

This enables external tablespaces in MySQL. Enable this, and when you create a table, MySQL puts all of the 16K pages for that table into a `.idb` file in the database's folder.

No matter what, there will always be a `.frm` file for the table in the database's folder.

Each page has a page id, and a given location - if the page cannot be found at that location with that specific page id, the table (and all of InnoDB) is corrupt.

info> In MySQL 5.6+, the location of those tables is recorded in the internal tablespace in some system tables. As a result, `innodb_file_per_table` only impacts new tables - existing tables can be created in the internal tablespace and they will continue to work.
info> 
info> In MySQL 5.5 and before, this determines where to look for the table's data.
info> 
info> In general, just set this to on or off when creating the datadir, and leave it there. If you need to convert, dump all tables and reimport.

warning> Removing any `.ibd` or `.frm` files in any folder can cause corruption across the InnoDB engine. Starting MySQL up with any extra `.ibd` or `.frm` files not created directly by MySQL in that location can also cause corruption across the InnoDB engine.

### InnoDB Buffer Pool ###

info> Think of this like the disk cache or swap space for a Linux system.

The InnoDB Buffer Pool is memory allocated by InnoDB. When a page is required and not in there, it is read into this pool. Pages can only be changed in this space. If this space is full, or by other triggers, InnoDB will flush certain pages to disk.

In MySQL 5.5 and before, this is set to 8M by default - far too low. You should always set this.

You can set the maximum size with `innodb_buffer_pool_size` in the `my.cnf` under the `[mysqld]` section.

### Internal InnoDB indexes ###

You should know that there are some internal InnoDB indexes. Mostly, it's important that you know three things:

* They exist/they are there.
* They are always in `ibdata1`
* They point to every `.ibd`, and any `.ibd` that doesn't line up will cause a problem
* They contain the id of every page for every table, and the file that page is stored in

If you want to mess with an `.ibd`, you have to change internal indexes which cannot be changed. On the plus side,  you can see what's in the internal indexes.

### innodb_table_monitor ###

If you want to see what is in the internal InnoDB internal indexes, create an InnoDB table named `innodb_table_monitor`. The internal InnoDB index will be written to the MySQL error log.

```mysql
CREATE TABLE innodb_table_monitor AS (id int) ENGINE=InnoDB;
```

### List all InnoDB tables ###

You can list all information on all InnoDB tables with the following:

```mysql
SELECT * FROM information_schema.tables WHERE ENGINE="InnoDB";
```

The following will report the database name and table name for each InnoDB table, separated by a space.

```bash
mysql -Bs information_schema -e 'SELECT table_schema, table_name FROM tables WHERE ENGINE="InnoDB";'
```

If `innodb_file_per_table` is set, it's also possible (and trivial) to find the InnoDB tables by their individual `.ibd` files:

```mysql
find /var/lib/mysql/ -name "*.ibd" -mindepth 2 -maxdepth 2 -type f -print|awk -F'/' '{gsub(".ibd$", "", $NF); print $(NF-1), $NF}'
```

Although you will probably have to do a bit more than this if you want to hit them by database name and table name.

```mysql
find /var/lib/mysql/ -name "*.frm" -mindepth 2 -maxdepth 2 -type f -print|awk -F'/' '{gsub(".frm$", "", $NF); print $(NF-1), $NF}'|while read db table; do [[ ! -a /var/lib/mysql/$db/$table.MYD ]] && echo $db $table; done
```

#### Dump all InnoDB tables ####

This will dump all innodb tables on the server to files named by the database and table name.

```bash
mysql -Bse 'SELECT table_schema, table_name FROM information_schema.tables WHERE ENGINE="InnoDB";'|while read db table; do echo "$db $table"; mysqldump $db $table > $db.$table.sql; done
```

ok> For most uses, you want to dump all tables, irregardless of engine.


### InnoDB Force Recovery mode ###

This is typically set in the my.cnf with the variable `innodb_force_recovery`.

If set to a non-zero value, InnoDB is in recovery mode and will not take any INSERT or UPDATE statements. You can create tables, however you cannot insert or modify any data - as seen below.

```mysql
mysql> CREATE TABLE animals(
           id MEDIUMINT NOT NULL AUTO_INCREMENT,
           name CHAR(30) NOT NULL,
           PRIMARY KEY (id) ) ENGINE=InnoDB;
Query OK, 0 rows affected (0.20 sec)

mysql> insert into animals (name) values ('dog'),('cat'),('bird');
ERROR 1030 (HY000): Got error -1 from storage engine
```

There are 6 enabled levels, 1-6. Each is detailed below. Behavior is undefined for other values (but will likely crash).

notice> If you are looking to recover data, start with level 4, and goto 6 if not successful.

| Level | CodeFlag | Actual Action |
|-------|----------|---------------|
| 1 | SRV_FORCE_IGNORE_CORRUPT | InnoDB will not crash if the checksum on a page is not correct. |
| 2 | SRV_FORCE_NO_BACKGROUND | InnoDB only starts up single threaded - this locks you to one action at a time. |
| 3 | SRV_FORCE_NO_TRX_UNDO | InnoDB will not rollback to undo incomplete transactions. |
| 4 | SRV_FORCE_NO_IBUF_MERGE | InnoDB will not roll forward to complete pending transactions. If InnoDB crashed doing a transaction (most likely) this will prevent that from happening again. |
| 5 | SRV_FORCE_NO_UNDO_LOG_SCAN | InnoDB ignores the undo logs. Every page, as it exists on disk, is treated as if it is accurate. |
| 6 | SRV_FORCE_NO_LOG_REDO | InnoDB starts up, and does no recovery at all. |

