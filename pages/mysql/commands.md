topic:mysql
author:jack

MySQL Commands
==============

This wiki contains all of the commands that are typically run throughout the rest of the MySQL wikis. Commands added here should be solid, and this can be used as quick reference for later if needed.

Extracting data from MySQL
--------------------------

### Dump all databases ###

```bash
echo "SHOW DATABASES;" | mysql -Bs |while read i ; do echo Dumping $i ; mysqldump --single-transaction $i > $i.sql ; done 
```

### Dump and compress all databases###

```bash
echo "SHOW DATABASES;" | mysql -Bs|while read i ; do echo Dumping $i ; mysqldump --single-transaction $i | gzip -c > $i.sql.gz ; done 
```

### Dump all tables ###

```bash
echo "SELECT table_schema, table_name FROM information_schema.tables WHERE TABLE_SCHEMA NOT IN ('mysql', 'information_schema', 'performance_schema');"|mysql -Bs|while read db table; do echo Dumping $db $table ; mysqldump $db $table > $db.$table.sql ; done
```

warning> Only for Escalations right now

In the event of MySQL system instability (information_schema is not available):

```bash
find /var/lib/mysql/ -type f -name "*.frm"|awk -F'/' '$(NF-1) !~ /^(mysql|performance_schema|information_schema)$/ {gsub(/.frm$/,"",$NF); print $(NF-1), $NF}'|while read db table; do sleep 2; echo dumping $db $table >> ./export.log ; mysqldump $db $table > $db.$table.sql 2>>./export.log ; done
```

### Dump all tables - Just primary columns ###

First, set a few variables:

```bash
dumpdest=
host=
```

```bash
mysqldump -h $host --no-data -A --single-transaction|awk 'BEGIN {table=db=""} /^CREATE DATABASE/ {db=$7; gsub(/`/,"",db);} /^CREATE TABLE/ {table=$3; gsub(/`/,"",table);} $1 ~ /PRIMARY/ {gsub(/\(|(\)\,)|\)/,"",$3); print db, table, "SELECT " $3 " FROM `" db "`.`" table "`;"}'|while read -r db table line; do mysql -h $host -Bse "$line" >> $dumpdest/$db.$table.$host.csv; done
```

### Dump MySQL User Privileges ###

```bash
mysqldump --extended-insert=FALSE mysql > mysql.sql
```

Importing data into MySQL
-------------------------

### Create a database for each database featured in a folder of table dumps ###

```bash
find . -maxdepth 1 -type f -name "*.sql"|awk -F'.' '{gsub(/^\//, "", $(NF-1)); print $(NF-1)}'|sort|uniq|xargs -L1 mysqladmin create
```

### Import all databases dumps in a folder ###

```bash
find . -maxdepth 1 -type f -name "*.sql"|awk -F'[/.]' '{print $(NF-1)}'|while read db; do echo Importing $db; mysql $db < $db.sql; done
```

### Decompress and Import all databases in a folder ###

```bash
find . -maxdepth 1 -type f -name "*.sql.gz"|awk -F'[/.]' '{print $(NF-1)}'|while read db; do echo Importing $db; gunzip $db.sql.gz|mysql $db; done
```

### Import one database from a mysqldump with multiple databases ###

```bash
mysql --one-database database_name < fulldump.sql
```

### Import all table dumps in a folder ###

```bash
find . -maxdepth 1 -type f -name "*.sql"|awk -F'.' '{gsub(/^\//, "", $(NF-2)); print $(NF-2) " " $(NF-1)}'|while read db table; do echo "Importing $db $table"; mysql $db < $db.$table.sql; done
```

Enabling a slow query log
-------------------------

Add to `/etc/my.cnf` in the `[mysqld]` section:

success> On MySQL 5.0 and below

```
log-slow-queries= /var/lib/mysql/slow.log
long_query_time = 1
```

success> On MySQL 5.1+

```
slow_query_log = 1
slow_query_log_file = /var/lib/mysql/slow.log
long_query_time = 1
```

success> After enabling the slow query log in the my.cnf, restart mysql.

Test the slow query log by running a sleep query and looking for that query.

```
SELECT SLEEP(2);
```

Old Password format vs New password format
------------------------------------------

### Find all users with old style password ###

MySQL CLI:

```
SELECT Host, User, Password AS Hash FROM mysql.user WHERE Password REGEXP '^[0-9a-fA-F]{16}' ORDER BY User, Host;
```

### Find all users with new style password ###

MySQL CLI:

```
SELECT Host, User, Password AS Hash FROM mysql.user WHERE Password REGEXP '^\\*[0-9A-F]{40}$' ORDER BY User, Host;
```

### Show Lengths of all regardless of style ###
Old style will be 16, 41 is the current hash length

```
SELECT user, Length(Password) FROM mysql.user;
```

### Locate config files that may contain passwords for user-defined database users ###
This seems to work okay, if you have questions jabber jwarren. Run from ssh as root (not in the MySQL CLI):

```bash
mysql -Ns -e "SELECT User FROM mysql.user WHERE Password REGEXP '^[0-9a-fA-F]{16}';" |grep "_" |sort |uniq |while read dbuser; do acct=`echo $dbuser |cut -d'_' -f1`; config=`grep -Rl "$dbuser" /home/$acct/public_html`; echo $dbuser $config; done
```

This grabs the user-defined database users, and checks their respective cPanel accounts for configuration files that may contain their passwords in plain text. It outputs as $db_user $/path/to/file. Only works on cPanel servers.

### Set Password in Old Format ###

On a server with the new password hashing format, you can set a password of the old format with either:

```mysql
SET PASSWORD for '$USER'@'$HOST' = OLD_PASSWORD('$PASSWORD');
```

```mysql
UPDATE mysql.user SET Password = OLD_PASSWORD('$PASSWORD') WHERE User = '$USER' AND Host = '$Host';
FLUSH PRIVILEGES;
```

### Set Password in New Format ###

On a server with the old password hashing format, you can set a password of the new format with either:

```
SET SESSION old_passwords=FALSE;
SET PASSWORD for '$USER'@'$HOST' = PASSWORD('$PASSWORD');
```

```
SET SESSION old_passwords=FALSE;
UPDATE mysql.user SET Password = PASSWORD('$PASSWORD') WHERE User = '$USER' AND Host = '$HOST';
FLUSH PRIVILEGES;
```

If the above aren't working, I've had success with the below steps:

```
SET old_passwords = 0;
UPDATE mysql.user SET plugin = 'mysql_native_password', Password = PASSWORD('$PASSWORD') WHERE (User, Host) = ('$USER', '$HOST');
FLUSH PRIVILEGES;
```

MySQL Status Information
------------------------

### Show used portion of connections ###

```
SELECT ( pl.connections / gv.max_connections ) * 100 as percentage_used_connections from ( select count(*) as connections from information_schema.processlist ) as pl, ( select VARIABLE_VALUE as max_connections from information_schema.global_variables where variable_name = 'MAX_CONNECTIONS' ) as gv;
```

MySQL database backups
----------------------

### MySQL database dump script ###

* No rotation
* Runs daily at 4:02 am.
* Dumps to /backup/mysql_backup/
* email_address@domain.com needs to be changed.
* Should all be put in the file /etc/cron.d/mysql_backups

```bash
 #!/bin/bash
 MAILTO='email_address@domain.com'
2 4 * * * root mkdir -p /backup/mysql_backups/ ; /bin/echo "show databases"|/usr/bin/mysql -Bs|/bin/egrep -v 'roundcube|modsec|mysql|horde|eximstats|leechprotect|logaholicDB.*|cphulkd|information_schema|performance_schema'|while read db; do /usr/bin/mysqldump --single-transaction $db |gzip > /backup/mysql_backups/$db.sql.gz; done
 ```

Kill all running MySQL queries
------------------------------
```bash
mysql -Bse 'show processlist;'|awk '{print $1}'|xargs -L1 mysqladmin kill
```

List all table sizes
--------------------

```
SELECT TABLE_SCHEMA AS 'Database', TABLE_NAME AS 'Table',  CONCAT(ROUND(((DATA_LENGTH + INDEX_LENGTH - DATA_FREE) / 1024 /  1024),2),\" MiB\") AS Size FROM INFORMATION_SCHEMA.TABLES;
```

List all database sizes
-----------------------

```
SELECT table_schema "DB Name", Round(Sum(data_length + index_length) / 1024 / 1024, 1) `DB Size in MB` FROM information_schema.tables  GROUP  BY table_schema ORDER BY `DB Size in MB` DESC;
```

Extract one DB from a dump
--------------------------------------------------

```bash
sed -n '/^-- Current Database: "singledb"/,/^-- Current Database: `/p' fulldump.sql > singledb.sql
```

Extract one table from a dump
-----------------------------

```bash
sed -n '/^-- Table structure for table `singletable`/,/^-- Table structure for table/p' dbdump.sql > singletable.sql
```

Check All Tables
----------------

danger> If `/tmp` fills, cancel the check and change the MySQL `tmpdir`.

```bash
mysqlcheck -Asc
```

### Repair a table ###

```bash
mysqlcheck -r database table
```

### Repair a DB ###

```bash
mysqlcheck -r database
```

### Optimize a table ###

info> This is only ever useful if `mysqlcheck` tells you the table is fragmented.

```bash
mysqlcheck -o database table
```

### If Table Repair Fails ###

notice> Only do this if the standard repair failed.

```bash
mysqlcheck -r --use-frm database table
```

If that fails, you have to repair more intensively.

```bash
/usr/local/cpanel/bin/tailwatchd --disable=Cpanel::TailWatch::ChkServd
/etc/init.d/mysql stop
```

With MySQL stopped, check the specific table:

```bash
myisamchk -fU /var/lib/mysql/database/table.MYI
```

If that kicked an error, with MySQL stopped, check the specific table:

```bash
myisamchk -fUr /var/lib/mysql/database/table.MYI
```

If that kicked an error (and did not complete), drop and reimport the table from backups.

Finally, start MySQL back up.

```bash
/etc/init.d/mysql start
/usr/local/cpanel/bin/tailwatchd --enable=Cpanel::TailWatch::ChkServd
```

MySQL `tmpdir`
--------------

You can specify an alternate tmpdir for MySQL the `tmpdir` variable in `my.cnf`. Once changed, restart MySQL.

```bash
tmpdir=/tmp # the default, in /tmp
```

To put the `tmpdir` on `/home`

```
tmpdir=/home/mysql.tmpdir
```

To put the `tmpdir` in memory:

```
tmpdir=/dev/shm
```
info> If you create a new tmpdir, it should be created with:
info> ```bash
info> mkdir /home/mysql.tmpdir
info> chmod 751 /home/mysql.tmpdir
info> chown mysql:mysql /home/mysql.tmpdir
info> ```


Restore Grants on cPanel
------------------------

```bash
\ls /var/cpanel/users/ | xargs -I{} /usr/local/cpanel/bin/restoregrants --cpuser={} --db=mysql --all
```

Starting MySQL Without Grants
-----------------------------

```bash
mysqld_safe --skip-grant-tables --skip-networking --socket=/tmp/secure.sock &
```

You then interact with MySQL with things like the following:

```bash
mysql --socket=/tmp/secure.sock
mysqladmin --socket=/tmp/secure.sock
mysql_upgrade --socket=/tmp/secure.sock
```

Run `mysql_upgrade` on cPanel
-----------------------------

```bash
/usr/local/cpanel/bin/tailwatchd --disable=Cpanel::TailWatch::ChkServd
/etc/init.d/mysql stop
mysqld_safe --skip-grant-tables --skip-networking --socket=/tmp/secure.sock &
sleep 10
mysql_upgrade --socket=/tmp/secure.sock
```

ok> Wait, watch for errors.

```bash
/etc/init.d/mysql restart
/usr/local/cpanel/bin/tailwatchd --enable=Cpanel::TailWatch::ChkServd
```

Run `mysql_upgrade`
-------------------

```bash
/etc/init.d/mysql stop
mysqld_safe --skip-grant-tables --skip-networking --socket=/tmp/secure.sock &
sleep 10
mysql_upgrade --socket=/tmp/secure.sock
```

ok> Wait, watch for errors.

```bash
/etc/init.d/mysql restart
```

Reset MySQL Root PW on cPanel
-----------------------------

First, update the root password in `/root/.my.cnf`.

```bash
/usr/local/cpanel/bin/tailwatchd --disable=Cpanel::TailWatch::ChkServd
/etc/init.d/mysql stop
mysqld_safe --skip-grant-tables --skip-networking --socket=/tmp/secure.sock &
awk -F'=' '$1 ~ /^pass/ {print $2;}' /root/.my.cnf|xargs -L1 echo|awk '{print "SET PASSWORD FOR '\''root'\''@'\''localhost'\'' = PASSWORD('\''" $0 "'\'');"}'|tail -n1|mysql -p
/etc/init.d/mysql restart
/usr/local/cpanel/bin/tailwatchd --enable=Cpanel::TailWatch::ChkServd
```

Reset MySQL root PW on Other
----------------------------

```bash
/etc/init.d/mysql stop
mysqld_safe --skip-grant-tables --skip-networking --socket=/tmp/secure.sock &
awk -F'=' '$1 ~ /^pass/ {print $2;}' /root/.my.cnf|xargs -L1 echo|awk '{print "SET PASSWORD FOR '\''root'\''@'\''localhost'\'' = PASSWORD('\''" $0 "'\'');"}'|tail -n1|mysql -p
/etc/init.d/mysql restart
```
