topic:mysql
author:jack
title: MySQL Troubleshooting

MySQL Troubleshooting
=====================

Datadir Disk Full
-----------------

If the datadir fills, everything is weird. If you can clean other stuff, and let MySQL continue running, you might be ok.

warning> Things will just be weird if the filesystem is full.

`tmpdir` Disk Full
------------------

notice> Check both free space and inodes.

Most commonly, this will stop a `mysqlcheck` to never finish. You may also see an error (listed again below).

Multiple instances running
--------------------------

Thanks to `tailwatchd` there can be multiple instances of `mysqld` running.

```bash
ps faux | grep mysql
```

Sometimes, it will even get so bad that one instance will have the flock on the MySQL datadir, another will have `/var/lock/subsys/mysql`, another will have `/var/spool/run/mysql.pid`, another will have port `3306`, and a final one will have the socket.

Stop all running versions, and start just one.

MySQL flapping
--------------

```bash
while true; do pgrep -d' ' mysqld; sleep 10; done
```

This should print the same pid over and over - if it does not, there's something wrong.

`/scripts/mysqlup` failed to download error
-------------------------------------------

If you run `/scripts/mysqlup` and see

```
Failed to download http://httpupdate.cpanel.net/RPM/11.30/centos/unknown/i386/MySQL-server-5.0.95-0.cp1130.glibc23.i386.rpm.
```

In the file `/var/cpanel/sysinfo.config` change the following line:

```
rpm_dist_ver=unknown
```

To match the first version number from:

```bash
cat /etc/redhat-release
```

ok> On CentOS 4, this should read:
ok> 
ok> ```bash
ok> rpm_dist_ver=4
ok> ```

Host `host_name` is blocked
---------------------------

The host in question has attempted to connect to MySQL (unsuccessfully) enough that MySQL has now locked it out. Running the following command will clear out all of these lockouts:

```bash
mysqladmin flush-hosts
```

Can't open file: './somedatabase/sometable.frm' (errno: 24)
-----------------------------------------------------------

This is because the ulimit for the number of allowed open files is too low or the `open_files_limit` in /etc/my.cnf is too low. Check `ulimit` with this:

```bash
pgrep -f /usr/sbin/mysqld| xargs -L1 -I {} grep open /proc/{}/limits
lsof -u mysql|wc -l
```

This returns:

* Max number of open files allowed by ulimit.
* Current number of files open by MySQL.

If the second value is closed to the first (within 5%) increase the ulimit.

You may also see errors in the MySQL error log similar to:

```
Can't open file: './somedatabase/sometable.frm' (errno: 24)

[ERROR] Error in accept: Too many open files
```

### CentOS 6 and below ###

Raise the limit by editing `/etc/security/limits.conf` and add/change:
 
```
mysql           soft nofile 65535
mysql           hard nofile 65535
```

### CentOS 7 and other Systemd ###

Instead of setting limits in `/etc/security/limits.conf`, `systemd` uses per service limits in the unit files.

ok> MariaDB specific

```bash
mkdir -p /etc/systemd/system/mariadb.service.d
cat <<EOM > /etc/systemd/system/mariadb.service.d/limits.conf
[Service]
LimitNOFILE=65535
EOM
```

ok> MySQL Specific

```bash
mkdir -p /etc/systemd/system/mysql.service.d
cat <<EOM > /etc/systemd/system/mysql.service.d/limits.conf
[Service]
LimitNOFILE=65535
EOM
```

notice> To stop cPanel from overriding this, run the following.

> Let cPanel determine the best value for your MySQL open_files_limit configuration? 

MySQL Won't Start with A pthread create error
---------------------------------------------

```
090127 11:33:58  mysqld started
InnoDB: Error: pthread_create returned 12
090127 11:33:59  mysqld ended
```

It is a ulimit problem on the machine. Check with `ulimit -a` and note the s size. Try changing it with `ulimit -s 8192` and then start MySQL. This applies to 32 bit systems only. [Source](http://sources.redhat.com/ml/glibc-bugs/2007-03/msg00086.html)

MYSQL showing 0 size in cPanel
------------------------------

Run `/scripts/update_db_cache` and troubleshoot the error it returns.

MySQL Running Out of Connections on Windows
-------------------------------------------

Often this presents as Plesk Control Panel not loading due to excessive connections:

```
Error Message: ERROR: PleskMainDBException DB query failed: Unknown error

0: common_func.php3:171 db_query(string 'set names utf8') 1: common_func.php3:626 reconnect() 2: common_func.php3:591 db_connect() 3: auth.php3:90
```

Try resetting the `admin` password. If same issu persists, open the registry and in the key `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters` set:

```
Value Name: MaxUserPort
Data Type: REG_DWORD
Value: 65534
```

```
Value Name: TcpTimedWaitDelay
Data Type: REG_DWORD
Value: 30
```
[source](http://dev.mysql.com/doc/refman/5.1/en/can-not-connect-to-server.html)

InnoDB Disabled
---------------

If InnoDB tables seem to be causing problems, or are failing, it is possible that InnoDB support is disabled. You can check this with:

```mysql
mysql>show engines;
```

If you run a mysqcheck and MySQL crashes while checking a table, or you get a response like:

```
Error    : Incorrect information in file: './halp_blah/example_innodb.frm'
Error    : Corrupt
```

InnoDB is crashes. Proceed to [MySQL Recovery](/mysql/mysql_recovery).

Lots of locked tables
---------------------

[MySQL Table Locking](http://dev.mysql.com/doc/refman/5.0/en/table-locking.html)

If you see **many** locks on a table (or tables, specifically MyISAM not InnoDB), the option `low_priority_updates` may help. This puts `SELECT` statements at a higher priority than `INSERT` and `UPDATE` statements.

Add the following line to `/etc/my.cnf` and restart MySQL:

```
low_priority_updates = 1 
delay_key_write = 1
```

This will crash `MyISAM` tables on a MySQL crash, but it will result in better `MyISAM` performance.

Client does not support authentication
--------------------------------------

```
Warning: mysql_connect(): Client does not support authentication
protocol requested by server; consider upgrading
```

Usually, this means the client and server version do not match up.

Determine client version with `mysql -v` or similar.

Determine server version with `mysqladmin version`

Cannot load from mysql.proc
---------------------------

If you get this error, they likely just upgraded to 5.5. This can be corrected by running `mysql_upgrade`.

Server requested authentication method unknown to client
--------------------------------------------------------

```
Warning: PDO::__construct(): The server requested authentication method
unknown to the client [mysql_old_password]
```

The server is using a mix of old passwords and new passwords. Switch over to all new passwords to correct.

Server Errors
-------------

Sometimes, when you run a query, you get back an error:

```mysql
SELECT * FROM no_such_table;
ERROR 1146 (42S02): Table 'test.no_such_table' doesn't exist'
```

The error is three parts:

* A numeric MySQL error code (`1146`).
* A five-character SQLSTATE value (SQL standard) ('42S02').
* A string that provides a textual description of the error. This is what you want.

info> The value 'HY000' (general error) is used for MySQL errors that do not map to SQL errors.

CloudLinux MySQL Governor
-------------------------

```text
[Sat Aug 23 16:13:56 2014] Open write connection operation
[Sat Aug 23 16:13:56 2014] Try to connect with options from dbgovernor config file
[Sat Aug 23 16:13:56 2014] Try to connect with no password under root
[Sat Aug 23 16:13:56 2014] Try to connect with options from dbgovernor config file
[Sat Aug 23 16:13:56 2014] Try to connect with no password under root
[Sat Aug 23 16:13:56 2014] MySQL version correct 5.1.73-cll-lve
[Sat Aug 23 16:13:56 2014] Started
[Sat Aug 23 16:13:56 2014] Governor work without LVE (no)
[Sat Aug 23 16:13:56 2014] BAD list init successfully
[Mon Aug 25 00:15:41 2014] Failed governor daemon, restart daemon
[Fri Aug 29 08:42:07 2014] Failed governor daemon, restart daemon
[Fri Aug 29 08:42:11 2014] Open govern connection operation
[Fri Aug 29 08:42:12 2014] Try to connect with options from dbgovernor config file
[Fri Aug 29 08:42:13 2014] Try to connect with no password under root
[Fri Aug 29 08:42:13 2014] Open write connection operation
[Fri Aug 29 08:42:13 2014] Try to connect with options from dbgovernor config file
[Fri Aug 29 08:42:13 2014] Try to connect with no password under root
[Fri Aug 29 08:42:13 2014] Try to connect with options from dbgovernor config file
[Fri Aug 29 08:42:13 2014] Try to connect with no password under root
[Fri Aug 29 08:42:13 2014] MySQL version correct 5.1.73-cll-lve
[Fri Aug 29 08:44:27 2014] MySQL server has gone away
[Fri Aug 29 08:44:27 2014] Can't flush user privs
[Fri Aug 29 08:44:27 2014] Started
[Fri Aug 29 08:44:27 2014] Governor work without LVE (no)
[Fri Aug 29 08:44:27 2014] BAD list init successfully
[Fri Aug 29 08:44:27 2014] Can't execute sql request. ENABLE_GOVERNOR
[Fri Aug 29 08:44:27 2014] Can't execute sql request. ENABLE_GOVERNOR
[Fri Aug 29 08:44:27 2014] Failed governor daemon, restart daemon
[Fri Aug 29 08:45:27 2014] Can't execute sql request. ENABLE_GOVERNOR
[Fri Aug 29 08:45:27 2014] Failed governor daemon, restart daemon
[Fri Aug 29 08:46:27 2014] Can't execute sql request. ENABLE_GOVERNOR
[Fri Aug 29 08:46:27 2014] Failed governor daemon, restart daemon
[Fri Aug 29 08:52:41 2014] Failed governor daemon, restart daemon
[Fri Aug 29 08:52:42 2014] Open govern connection operation
```

Either remove `governor-mysql` or get them off CloudLinux 5 - perferably the second, pushing them to CloudLinux 6.

You can reinstall the MySQL GOvernor with:

```bash
yum remove db-governor db-governor-mysql
yum install governor-mysql --enablerepo=cloudlinux-updates-testing
/usr/share/lve/dbgovernor/mysqlgovernor.py --install
```

Starting MySQL.. ERROR! Manager of pid-file quit without updating file
----------------------------------------------------------------------

You tried to start MySQL, and it shut down right away.

Check `/var/lib/mysql/hostname.err` (for your platform) for the error.

Temporary failure in name resolution
------------------------------------

```text
IP address '192.168.1.201' could not be resolved: Temporary failure in name resolution
```

* A user connected from an IP
* The rDNS lookup for that IP failed


You can skip IP lookups for connecting users with:

```text
skip-host-cache
skip-name-resolve
```

notice> If you do this, make sure all grants are done by IP.

Too Many Queries Processes
--------------------------

* If the queries are in `Sleep` state, lower `wait_timeout`
* If the queries are active and long running, dial back `interactive_timeout`
* Consider [looking at performance](/mysql/mysql_performance) to speed up the queries.