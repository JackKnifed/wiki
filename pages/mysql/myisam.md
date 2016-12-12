author: jack
topic: training
topic: mysql
title: MyISAM Internals

MyISAM Internals
================

What it is
----------

MyISAM is a storage engine for MySQL. It boasts stability, longevity, and table level locking, but sacrafices foreign key constraints and row level locking. It dates back to MySQL 4.0.

You can check if it's present  - but it should not crash.

```mysql
show engines;
```

To convert a table to the MyISAM engine:

```mysql
ALTER TABLE example_myisam ( id INT, data VARCHAR(100)) ENGINE=MyISAM;
```

Each MyISAM table is stored in three files:

* `.frm` to store the table metadata, column names and types, and table statistics
* `.MYD` to store the rows for the table
* `.MYI` to store the indexes for the table (still present if no indexes)

Enable/Disable MyISAM
---------------------

MyISAM cannot be disabled, but you can see it's status by running `show engines;`.

MariaDB replaces the MyISAM engine with the Aria engine.

MyISAM Internals
----------------

The `.MYD` file is row storage in MyISAM. Rows are seperated by a row seperator, as due to the `VARCHAR` row size is not consistent. Besides the row seperators, the rows are not seperated in any specific way.

When new rows are added, they are appended to the end of the `.MYD` file. When rows are changed, they are usually changed in place (depending on how the change happens). When a row is deleted, it's marked as deleted, not actually removed.

The `.MYI` file containes the indexes for the table, stored in 16K pages. As this is just an index, each index will only contain a part of the table's data - just the columns in that index. The reference back to the `.MYD` in an index is a byte offset pointer to that location in the file - the primary key is not stored.

### Repair ###

As usual, indexes are expected to normally be kept up to date. Occasionally that does not happen - and occasionally repairing a MyISAM table will correct the index. Other abnormal conditions can surface, those are corrected with the same command.

```bash
mysqlcheck -r database table
```

Optimization of a MyISAM table means copying the non-deleted rows to a new table, sorting that table by the primary key, then writing that table back to the `.MYD` in order by the primary key.

```bash
mysqlcheck -o database table
```

### `key_buffer` ###

The `key_buffer` in MyISAM is a read-only cache of indexes shared among tables. When a MyISAM table is changed, the `.MYD` is updated on the disk, but the indexes are modified in the `key_buffer` (this makes them dirty) and flushed to disk when possible.

The `key_buffer_size` (MySQL 5.5 and up, `key_buffer` in 5.1 and earlier) is used to control the size of this buffer.

### List all MyISAM tables ###

You can list all information on all InnoDB tables with the following:

```mysql
SELECT * FROM information_schema.tables WHERE ENGINE="MyISAM";
```

The following will report the databbase name and table name for each InnoDB table, seperated by a space.

```bash
mysql -Bs information_schema -e 'SELECT table_schema, table_name FROM tables WHERE ENGINE="MyISAM";'
```

If MySQL is not running, the following can be used to list MyISAM tables.

```mysql
find /var/lib/mysql/ -name "*.MYD" -mindepth 2 -maxdepth 2 -type f -print|awk -F'/' '{gsub(".MYD$", "", $NF); print $(NF-1), $NF}'
```

#### Dump all MyISAm tables ####

This will dump all innodb tables on the server to $db.$table.sql files. 

```bash
mysql -Bse 'SELECT table_schema, table_name FROM information_schema.tables WHERE ENGINE="MyISAM";'|while read db table; do echo "$db $table"; mysqldump $db $table > $db.$table.sql; done
```

ok> For most uses, you want to dump all tables, irregardless of engine.