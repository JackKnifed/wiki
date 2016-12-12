author : jack
topic : mysql
topic : cpanel

cPanel MySQL Upgrades/Downgrades
================================

Overview
--------

info> MySQL upgrades consist of the below steps

* Plan around problems/gotchas
* Dump DBs and prep for upgrade
* Upgrade the binaries
* Upgrade the tables/reimport if required
* Upgrade/recompile anything that was compiled against old libraries
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

warning> EasyApache 3 no longer supports PHP 5.2 or lower.

If you are going to change MySQL versions and are on PHP 5.2, you need to also plan on upgrading PHP to 5.3 or higher.

There is an unmanaged patch for EasyApache to add support for PHP 5.2 back in. It's a delicate hack that does not always work.

notice> Check the PHP modules, you will likely have to recompile each of them during/after the PHP recompile.

#### Apache ####

warning> EasyApache no longer supports Apache 2.0 or lower.

If you are going to change MySQL versions, you need to plan on upgrading to Apache 2.2 at least, and more likely 2.4

notice> Check the Apache modules, you will likely have to recompile each of them during/after the PHP recompile.

#### EA Backups ####

```bash
mkdir -p /home/lwtemp; TS=$(date -u +%Y-%m-%d-%H:%M:%S%z); EACH=/usr/local/apache/conf/httpd.conf; [[ -x $EACH ]] && cp $EACH /home/lwtemp/httpd.conf.$TS; EACH=/usr/local/apache/conf/php.conf; [[ -x $EACH ]] && cp $EACH /home/lwtemp/php.conf.$TS; EACH=/usr/local/lib/php.ini; [[ -x $EACH ]] && cp $EACH /home/lwtemp/php.ini.$TS; FILE=/home/lwtemp/preEA.$USR; touch $FILE && chmod 600 $FILE; cat > $FILE <( echo -e "\n\n### Created: $TS ###\n"; EACH=/usr/local/cpanel/bin/rebuild_phpconf; [[ -x $EACH ]] && $EACH --current 2>&1; EACH=/usr/bin/php4; [[ -x $EACH ]] && $EACH -v 2>&1 && $EACH -m 2>&1; EACH=/usr/bin/php5; [[ -x $EACH ]] && $EACH -v 2>&1 && $EACH -m 2>&1; EACH=/usr/local/apache/bin/httpd; [[ -x $EACH ]] && $EACH -V 2>&1 && $EACH -l 2>&1; echo -e "\n### Specific Module Checks ###\n"; [[ -x /usr/bin/php ]] && /usr/bin/php -m|grep -e 'ffmpeg' -e 'memcache' -e 'magick' -e 'apc' -e 'xcache' -e 'eaccel' -e 'xcache'|tee -a $FILE;);
```

#### cPanel ####

Make sure that the version of cPanel you are on supports the version of MySQL/MariaDB/Percona that you're going for.

**By cPanel version**:

* `11.32` - MySQL `5.0`, `5.1`, `5.5`
* `11.38` - MySQL `5.1`, `5.5`
* `11.42` - MySQL `5.1`, `5.5`, `5.6`
* `11.46` - MySQL `5.5`, `5.6`
* `11.48` - MySQL `5.5`, `5.6` & MariaDB `10.0`
* `54` - MySQL `5.5`, `5.6` & MariaDB `10.0`, `10.1`

**By MySQL version**:

* MySQL `4.0` supported on cPanel _unknown_ - `11.32`
* MySQL `4.1` supported on cPanel _unknown_ - `11.34`
* MySQL `5.0` supported on cPanel _unknown_ - `11.38`
* MySQL `5.1` supported on cPanel _unknown_ - `11.46`
* MySQL `5.5` supported on cPanel `11.32` - _current_
* MySQL `5.6` supported on cPanel `11.42` - _current_
* MariaDB `10.0` support on cPanel `11.48` - _current_
* MariaDB `10.1` supported on cPanel `54` - _current_

info> cPanel will upgrade to 11.44 with MySQL 5.0 or 5.1 to allow upgrading MySQL.

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

#### cPanel pre-11.36 ####

Change `mysql-version` in `/var/cpanel/cpanel.config`.

* `5.0` for `MySQL 5.0`
* `5.1` for `MySQL 5.1`
* `5.5` for `MySQL 5.5`

Apply the new version:

```bash
/scripts/mysqlup --force
```

#### cPanel 11.36+ ####

info> Certain versions will not accept certain values.

Change `mysql-version` in `/var/cpanel/cpanel.config`.

* `5.0` for `MySQL 5.0`
* `5.1` for `MySQL 5.1`
* `5.5` for `MySQL 5.5`
* `5.6` for `MySQL 5.6`
* `5.7` for `MySQL 5.7`

```bash
/scripts/check_cpanel_rpms --fix
```

#### Percona ####

For switching to Percona Server, you need to first [add the Percona repository](https://www.percona.com/doc/percona-server/5.5/installation/yum_repo.html):

```bash
yum install http://www.percona.com/downloads/percona-release/redhat/0.1-3/percona-release-0.1-3.noarch.rpm
```

Install the Percona shared libraries:

```bash
yum install Percona-Server-shared
```

Disable and remove MySQL and MariaDB:

```bash
/scripts/update_local_rpm_versions --edit target_settings.MySQL50 uninstalled
/scripts/update_local_rpm_versions --edit target_settings.MySQL51 uninstalled
/scripts/update_local_rpm_versions --edit target_settings.MySQL55 uninstalled
/scripts/update_local_rpm_versions --edit target_settings.MySQL56 uninstalled
/scripts/update_local_rpm_versions --edit target_settings.MariaDB100 uninstalled
/scripts/update_local_rpm_versions --edit target_settings.MariaDB101 uninstalled
/scripts/check_cpanel_rpms --fix
```

Install Percona:

```bash
yum install Percona-Server-55
```

#### MySQL non-Cpanel binaries ####

If you want to, you can install non-cPanel MySQL binaries. Doing so endangers cPanel support of the database.

You need to disable MySQL (see Percona section) then add the repository:

CentOs 7:

```bash
yum install https://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm
```

CentOS 6:

```bash
yum install https://dev.mysql.com/get/mysql57-community-release-el6-7.noarch.rpm
```

CentOS 5:

```bash
yum install https://dev.mysql.com/get/mysql57-community-release-el5-7.noarch.rpm
```

#### MariaDB non-cPanel binaries ####

Make sure you remove any other servers per the instructions in the Percona section.

Goto [this page and pick your options](https://downloads.mariadb.org/mariadb/repositories/) to get your repository and installation instructions.

Upgrading Tables
----------------

#### Upgrading ####

If upgrading MySQL, run the following. FOllow up on any errors.

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

* Reset grants to cPanel defaults

```bash
\ls /var/cpanel/users/ | xargs -I{} /usr/local/cpanel/bin/restoregrants --cpuser={} --db=mysql --all
```

Recompile Downstream
--------------------

#### EasyApache 3 ####

EA 3 compiles a static PHP binary against `libmysqlclient.so`. Therefore, you have to recompile PHP. Recompiling PHP requires recompiling Apache.

You should have a plan for this from the [Planning](#Planning) stage. Execute that plan.

#### Old Password Update ####

If there were old passwords, and you upgraded to MySQL 5.6 or higher, you should make sure any outstanding passwords are corrected.

```bash
mysql -e "SELECT Host, User, Password AS Hash FROM mysql.user WHERE Password REGEXP '^[0-9a-fA-F]{16}' ORDER BY User, Host;"
```

Cleanup
-------

As a final step, test the sites - and have them continue to run for a while. After a week of nominal operation, remove the backup folder you created and any old datadirs.
