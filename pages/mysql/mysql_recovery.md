author: jack
topic: mysql
title: MySQL Recovery Extraction

MySQL Repair
============

danger> This page is for level 3+ techs only.

The strategy for MySQL crashes is simple:

* Try to avoid this
* Prep work
* Cleanly dump everything we can, taking note of what we cannot
* Start a fresh datadir and set it up
* Import what we could dump
* Import any missing gaps from backups
* Clean up

Last Ditch Efforts
------------------

warning> The steps outlined in this wiki are drastic. Check the following items to see if you can avoid the rest of this.

* Is innodb engine working?

```bash
mysql -e 'show engines;'
```

* Read the mysql error log and see if it is something easily correctable!:

```bash
less /var/lib/mysql/`hostname`.err
```

* Try setting `innodb_force_recovery` to 1. If MySQL starts, remove it and see if MySQL starts again. If it does, as a final check, run the following - if successful you do not need to do anything.

```bash
mysqlcheck -Asc
```

danger> If InnoDB exhibits corruption, always create a new datadir. Even after recreating a single table or database, the corrupted pages remain in the tablespace, and will lead to further corruption.

* If the server has Guardian backups, always restore from that instead.

warning> Make sure you have a full MySQL datadir backup before any of the following.

* Sometimes an errant `.frm` causees issues, by removing it when MySQL is down you can correct issues.

* Sometimes an errant `.ibd` causes an errant `.frm` to be created, but there's never any tracking in the system tables. Removing both while MySQL is down can correct issues.

Prep Work
---------

### Backup the datadir ###

First things first, if you have not already, create a backup of the datadir. This can be done with the following - adjust as needed, and make sure your last rsync occurs while MySQL is shutdown.

```bash
rsync -aHlP /var/lib/mysql/ /backup/mysql.datadir.$(date -u +%F.%T%z)/
```


### Start MySQL in Recovery ###

In `/etc/my.cnf`, first `1`, `4`, then `6`.

```mysql
innodb_force_recovery=4
```

Then make sure you start/restart MySQL.

### Stop MySQL Monitoring ###

On cPanel:

```bash
/usr/local/cpanel/libexec/tailwatchd --disable=Cpanel::TailWatch::ChkServd
```

### Prep ###

In one terminal, run (and let it run):

```
mysql -Bse 'show variables like "log_error";'|awk '{print $2}'|xargs tail -f
```

In another terminal, start a screen:

```bash
screen -S "mysql_recovery"
```

info> Verify `/backup` has plenty of space - if it does not, modify `$dumpdest`.

Within that screen:

```bash
dumpdest=/backup/mysql.recovery.$(date -u +%F.%T%z)
datadir=$(mysql -Bse 'SHOW GLOBAL VARIABLES LIKE "datadir";')
mkdir -p $dumpdest/dbdumps
mysql -Bse 'show databases;'|grep -v -e 'information_schema' -e 'performance_schema' -e 'mysql' > $dumpdest/dbs.in
cat /dev/null > $dumpdest/export.log
```

Dump Permissions

```bash
mysqldump --events mysql > $dumpdest/mysql.sql
```

Dump Databases
--------------

success> Run multiple times. Does not repeat good DBs and delays on bad.

```bash
echo 'starting db dumps' | tee -a $dumpdest/export.log
[[ -f $dumpdest/dbs.bad ]] && mv $dumpdest/dbs.bad $dumpdest/dbs.in
cat $dumpdest/dbs.in|while read db; do echo 'dumping' $db | tee -a $dumpdest/export.log; mysqldump --single-transaction --triggers --routines --events $db  2>>$dumpdest/export.log&1 >$dumpdest/dbdumps/$db.sql; if [[ $? -ne 0 ]]; then echo $db >> $dumpdest/dbs.bad ; sleep 5 ; rm -f $dumpdest/dbdumps/$db.sql; fi; done
rm -f $dumpdest/dbs.in
```

Prep Tables
-----------

When you want to move onto tables, run the following to prep.

```bash
cat $dumpdest/dbs.bad|while read db; do mkdir -p $dumpdest/bad_dumps $dumpdest/tbldumps/$db; echo "SHOW TABLES FROM $db;"|mysql -Bs > $dumpdest/$db.tbl.in; done
```

Dump Tables
-----------

success> Run multiple times. Does not repeat good tables and delays on bad.

```bash
echo 'starting table dumps' | tee -a $dumpdest/export.log
find $dumpdest -mindepth 1 -maxdepth 1 -type f -name "*.tbl.bad"|awk '{orig=$0; gsub(".tbl.bad$", ".tbl.in", $0); print "mv", orig, $0}'|bash
find $dumpdest -mindepth 1 -maxdepth 1 -type f -name "*.tbl.in"|awk -F'/' '{gsub(".tbl.in", "", $NF); print $NF;}'|while read db; do cat $dumpdest/$db.tbl.in|while read tbl; do echo 'dumping' $db $tbl | tee -a $dumpdest/export.log; mysqldump --single-transaction --triggers --routines --events $db $tbl 2>>$dumpdest/export.log >$dumpdest/tbldumps/$db/$db.$tbl.sql; if [[ $? -ne 0 ]] ; then echo $tbl >> $dumpdest/$db.tbl.bad ; sleep 5 ; rm -f $dumpdest/tbldumps/$db/$db.$tbl.sql; fi; done; rm -f $dumpdest/$db.tbl.in; done
```

success> Last ditch attempt to grab the structure of any bad tables.
danger> Will not retrieve data - like truncating tables.

```bash
echo 'starting table structure panic' | tee -a $dumpdest/export.log
find $dumpdest -mindepth 1 -maxdepth 1 -type f -name "*.tbl.bad"|awk '{orig=$0; gsub(".tbl.bad$", ".tbl.in", $0); print "mv", orig, $0}'|bash
find $dumpdest -mindepth 1 -maxdepth 1 -type f -name "*.tbl.in"|awk -F'/' '{gsub(".tbl.in", "", $NF); print $NF;}'|while read db; do cat $dumpdest/$db.tbl.in|while read tbl; do echo 'dumping' $db $tbl | tee -a $dumpdest/export.log; mysqldump --single-transaction --triggers --routines --events --no-data $db $tbl 2>>$dumpdest/export.log >$dumpdest/tbldumps/$db/$db.$tbl.create ; if [[ $? -ne 0 ]] ; then echo $tbl >> $dumpdest/$db.tbl.bad ; sleep 5 ; rm -f $dumpdest/tbldumps/$db/$db.$tbl.create; fi; done; rm -f $dumpdest/$db.tbl.in; done
```

Config Settings
---------------

warning> Verify the following settings right now.

* Disable `innodb_force_recovery`
* Enable `innodb_file_per_table`

Create Datadir
--------------

The [instructions for this are actually in another page](/mysql/new_datadir).

Reimport Dumps
--------------

Reimport databases.

```bash
find $dumpdest/dbdumps -maxdepth 1 -type f -name "*.sql"|awk -F'[/.]' '{print $(NF-1)}'|while read db; do echo Importing $db; echo "CREATE DATABASE IF NOT EXISTS \`${db}\`;"|mysql; mysql $db < $dumpdest/dbdumps/$db.sql; done
```

Reimport tables.

```bash
find $dumpdest/tbldumps -maxdepth 1 -mindepth 1 -type d|xargs -L1 basename|awk '{print "CREATE DATABASE IF NOT EXISTS", $0,";"}'|mysql
find $dumpdest/tbldumps -maxdepth 2 -mindepth 2 -type f -name "*.sql"|xargs -L1 basename|tr '.' ' '|while read db tbl junk; do mysql $db < $dumpdest/tbldumps/$db/$db.$tbl.sql; done
```

Recreate missing tables.

```bash
find $dumpdest/tbldumps -maxdepth 2 -mindepth 2 -type f -name "*.create"|xargs -L1 basename|tr '.' ' '|while read db tbl junk; do mysql $db < $dumpdest/tbldumps/$db/$db.$tbl.sql; done
```

Reimport your original grants:

```bash
mysql mysql < $dumpdest/mysql.sql
```

warning> If there are any gaps, correct that.

Clean up
--------

If a cPanel server, run the following:

```bash
/usr/local/cpanel/libexec/tailwatchd --enable=Cpanel::TailWatch::ChkServd
\ls /var/cpanel/users/|xargs -L1 -I{} /usr/local/cpanel/bin/restoregrants --cpuser={} --db=mysql --all
mysql -e 'flush privileges;'
```

On all servers, notify the customer the location of:

* Any datadir backups you made
* The original datadir
* Any dump locations you made (likely in `/backup`)

The customer may review these items as they please. These locations should be removed to free up space.

info> Set the ticket to pending, turn off autoclose, and note that the locations have not been cleaned up yet.
