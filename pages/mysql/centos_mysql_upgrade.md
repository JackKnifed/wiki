author: jack
topic: mysql
topic: cpanel
title: cPanel MySQL Switching

cPanel MySQL Upgrades/Downgrades
================================

Overview
--------

info> MySQL upgrades consist of the below steps - you do not need to recompile on non-cPanel servers.

* Plan around problems/gotchas
* Dump DBs and prep for upgrade
* Upgrade the binaries
* Upgrade the tables/reimport if required
* Cleanup

Each step is outlined below.

Upgrade Path
------------

The MySQL Upgrade path is:

* MySQL 4.0 (MySQL AB)
* MySQL 4.1 (MySQL AB)
* MySQL 5.0 (Sun)
* MySQL 5.1 (Sun)
* MySQL 5.2 (Sun) _Private Release_
* MySQL 5.3 (Sun) _Private Release_
* MySQL 5.4 (Sun) _Private Release_
* MySQL 5.5 )Oracle)
* MySQL 5.6 )Oracle)
* MySQL 5.7 )Oracle)

info> Migrations from MySQL to the matching version (or higher) of Percona are considered upgrades.

notice> Moving from _any_ version of Percona to MySQL is a downgrade.

* Percona 5.1 is branched from MySQL 5.1
* Percona 5.5 is branched from MySQL 5.5
* Percona 5.6 is branched from MySQL 5.6
* Percona 5.7 is branched from MySQL 5.7

info> Migrations from MySQL to the matching version (or higher) of Maria are considered upgrades.

notice> Moving from _any_ version of MariaDB to MySQL is a downgrade.

* MariaDB 5.0 was _forked_ from MySQL 5.5
* MariaDB 10.0 kept pace with MySQL 5.6
* MariaDB 10.1 kept pace with MySQL 5.7

Planning
--------

#### Check for corruption ####

```bash
mysqlcheck -Asc
```

#### PHP ####

The version of PHP the server uses should be dynamically linked against `libmysqlclient` - so you shouldn't have to worry about that.

#### Old Passwords ####

notice> Old password format is broken in MySQL 5.6, removed in 5.7+. Address this during prep.

Check for old passwords with:

```mysql
SELECT Host, User, Password AS Hash FROM mysql.user WHERE Password REGEXP '^[0-9a-fA-F]{16}' ORDER BY User, Host;
```

Hunt the configs down for those users, and update the passwords.

#### MySQL Changes ####

warning> insert mysql version changes, version to version

###### [MySQL 5.0 Changes](http://dev.mysql.com/doc/mysqld-version-reference/en/mysqld-version-reference-optvar-changes-5-0.html) ######

* `basedir` - _**REMOVED**_

###### [MySQL 5.1 Changes](http://dev.mysql.com/doc/mysqld-version-reference/en/mysqld-version-reference-optvar-changes-5-1.html) ######

* `table_cache` -> `table_open_cache`
* `log_slow_queries` -> `slow_query_log`
* `key_buffer` -> `key_buffer_size`

###### [MySQL 5.5 Changes](http://dev.mysql.com/doc/mysqld-version-reference/en/mysqld-version-reference-optvar-changes-5-5.html) ######

* `safe_show_database` _**REMOVED**_
* `skip_locking` _**REMOVED**_
* `skip_symlink` _**REMOVED**_
* Various replication options removed - must be set within MySQL
 * `master-host` _**REMOVED**_
 * `master-password` _**REMOVED**_
 * `master-port` _**REMOVED**_
 * `master-user` _**REMOVED**_

###### [MySQL 5.6 Changes](http://dev.mysql.com/doc/mysqld-version-reference/en/mysqld-version-reference-optvar-changes-5-6.html) ######

* `log_slow_queries` _**REMOVED**_ (enabled if log is set)
* `performance_schema=0` _**NEW**_ is recommended

Backups and Prep
----------------

info> These steps should be done immediately before the time of the upgrade.

If you don't already have a folder:

```bash
ts=$(date -u +%Y-%m-%d-%H:%M:%S%z) && mkdir -p /home/lwtemp/mysql_upgrade.$ts && pushd /home/lwtemp/mysql_upgrade.$ts
```

Dump all databases:

```bash
 echo "SHOW DATABASES;"|mysql -Bs|grep -v -e 'information_schema' -e 'performance_schema'|while read i; do echo dumping $i; mysqldump --single-transaction $i|gzip -c > $i.sql.gz; done 
```

Upgrading Binaries
------------------

If your new MySQL version is already in system repositories, and you want to install it from there, you can.

Repositories/instructinos for other versions are below.

#### MySQL ####

Add the appropiate repository from below:

**CentOS 7**

```bash
yum install https://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm
```

**CentOS 6**

```bash
yum install https://dev.mysql.com/get/mysql57-community-release-el6-7.noarch.rpm
```

**CentOS 5**

```bash
yum install https://dev.mysql.com/get/mysql57-community-release-el5-7.noarch.rpm
```

Finally, find your binaries in yum and install them.

#### MariaDB non-cPanel binaries ####

Goto [this page and pick your options](https://downloads.mariadb.org/mariadb/repositories/) to get your repository and installation instructions.

#### Percona ####

For switching to Percona Server, you need to first [add the Percona repository](https://www.percona.com/doc/percona-server/5.5/installation/yum_repo.html):

```bash
yum install http://www.percona.com/downloads/percona-release/redhat/0.1-3/percona-release-0.1-3.noarch.rpm
```

Install the Percona shared libraries:

```bash
yum install Percona-Server-shared
```

Install Percona:

```bash
yum install Percona-Server-55
```

Upgrading Tables
----------------

#### Upgrading ####

If upgrading MySQL, run the following. Follow up on any errors.

info> If not successful, simply recreate the datadir and reimport. (next section)

```bash
mysql_upgrade
```

#### Recreate and Reimport ####

* Move the old datadir out of the way, and create a new datadir at `/var/lib/mysql`.
* `mysql_install_db`
* `chown -R mysql:mysql /var/lib/mysql`
* Start MySQL
* If MySQL 5.6, check the five tables.

warning> Add a link to the file tables.

* Reimport databases

```bash
find . -maxdepth 1 -type f -name "*.sql.gz"|grep -v 'mysql.sql.gz'|awk -F'[/.]' '{$NF=$(NF-1)=""; print}'|while read db; do echo Importing $db; mysql -Bse "CREATE DATABASE IF NOT EXISTS $db;"; gunzip $db.sql.gz|mysql $db; done
```

* Either reimport `mysql.sql.gz` or recreate the grants. You must migrate this dump into the current database.

Cleanup
-------

As a final step, test the sites - and have them continue to run for a while. After a week of nominal operation, remove the backup folder you created and any old datadirs.