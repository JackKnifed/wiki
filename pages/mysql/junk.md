topic: mysql
topic: junk
author: jack
title: mysql junk

This page is scraps left over from other places
===============================================

### Resizing innodb_log_file_size ###
info> MySQL 5.6.8 and later allow for dynamic resizing of innodb_log_file_size by simply altering the variable in my.cnf and restarting mysql, use the below instructions for older versions.

This process is relatively safe. The most important things are that MySQL is shut down cleanly and stays down until you are ready to start it back up. If innodb is shut down uncleanly for any reason it would rely on the logfiles to fix any problems with the ibdata file.

Always verify the paths to MySQL via the configuration. For example the log paths and datadir paths could be different.
 mysql -e "show variables;"

The above method also applies for increasing the log file size.

First stop crond and tailwatchd so MySQL does not get restarted mid process:

```bash
/usr/local/cpanel/bin/tailwatchd --stop
service crond stop
```

info> Editing the my.cnf will not take effect until the next time mysql is started. We do it before shutting down MySQL just to make 1 less step with mysql down.

Next set the new log file size in the configuration file my.cnf for example:

```config
innodb_log_file_size=10M
```

Next stop MySQL

```bash
/etc/init.d/mysql stop
```

Then move the current log files to .bak (I recommend also appending the ticketID ib_logfile0.bak-ticketid), also keep in mind that the mysql datadir could be different depending on the configuration. Check the datadir with the following:
 mysql -e "show variables LIKE 'data%';"

Then move the log files according to the datadir path (in this case the datadir path is /var/lib/mysql):

```bash
mv /var/lib/mysql/ib_logfile0{,.bak}
mv /var/lib/mysql/ib_logfile1{,.bak}
```

Then start MySQL to initialize new log files for innodb:

```bash
/etc/init.d/mysql start
```

Lastly start tailwatchd and crond back up:

```bash
/usr/local/cpanel/bin/tailwatchd --start
service crond start
```

Verify the new log file size and check the error log for any errors and initialization info (usually the location unless specified otherwise in the conf):

```bash
tail -300 /var/lib/mysql/hostname.err 
```
 
Also this should show the new value in bytes:

```bash
mysql -e "show variables LIKE 'innodb_log_file_size%';"
```

Restore Innodb from flat files/guardian/shared backups
------------------------------------------------------

Innodb doesn't work like MyISAM where you can just rsync or cp the files in to place and expect it to work. It relies on the ib_log and ibdatafiles to keep its data in sync. The best way to restore these from flat files is to use a secondary server and generate .sql files which you can import.

There is an innodb.sysres server on the [https://billing.int.liquidweb.com/mysql/content/admin/account/?accnt=160 sysres account] you can use for this purpose. If it is gone kick up a fresh server (core managed will be fine, just install mysqld from rpms).  

This will assume your innodb restore server has no mysql (or other) data you really care about.

On your restore server:

* stop mysql (if you fail to do so when you try to rester the server it will fail)
* From the server/backups you want to restore from, you will need to copy over these things to their appropriate locations on the innodb restore server:
** The database directory that you wish to restore.(ex /var/lib/mysql/user_wrdp1)
** The ibdata1, ib_logfile0, ib_logfile1 files in /var/lib/mysql (or other datadir if applicable). Make sure to pull these from the same time as what you are getting your database files from, otherwise they will be out of sync. If they are out of sync you will fail.
** /etc/my.cnf - it will probably contain settings for the innodb table size and other settings.
** The mysql Database, (ex /var/lib/mysql/mysql, NOT /var/lib/mysql). (If you know the mysql root password on your restore server, you may not need this.)
** The mysql root user's password from /root/.my.cnf.   (If you know the mysql root password on your restore server, you may not need this.)
* Start mysql on the restore server.
* Dump your database (mysqldump)
* If the dump is successful, you can transfer it back to the original server and restore it there.

#### Things to note ####

* Make sure, if possible, you dump the database prior to importing the restored database. Make sure there is a way to undo the changes you are making.
* If someone in an attempt to restore the database tried to drop it mysql may not have removed the directory. If the tables are crashed innodb will skip them. If a drop database is attempted mysql will not see the table, and therefore not delete them. This will cause issues when attempting to import the restored database. You will need to remove the directory manually, and possibly restart mysql. 
* If the databases were backed up via rsync it's possible there were changes made during the backup that will cause the backups to be out of sync. If this is the case you will need to dump everything table by table, and then attempt to recover any missing tables from another backup.