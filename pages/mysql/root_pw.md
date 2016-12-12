topic: mysql
author: jack
title: MySQL root PW reset

Reset MySQL root user
=====================

There is no longer one way to do this - different ways raise different issues.

info> If you are on cPanel, you are going to want to disable `chkservd` monitoring.
info>
info> `/usr/local/cpanel/bin/tailwatchd --disable=Cpanel::TailWatch::ChkServd`
info>
info> Once you are done, remember to re-enable
info>
info> `/usr/local/cpanel/bin/tailwatchd --enable=Cpanel::TailWatch::ChkServd`

Single User Mode - Linux
------------------------

warning> When started with this, MySQL will let any connections in with any password as root.
warning> Do not leave MySQL in this mode.

Stop MySQL. Make sure the password you want is in `/root/.my.cnf`.

Start MySQL in `skip-grant-tables`

```bash
mysqld_safe --skip-grant-tables &
mysql
awk -F'=' '$1 ~ /^pass/ {print $2;}' /root/.my.cnf|xargs -L1 echo|awk '{print "UPDATE mysql.user SET PASSWORD='\''" $0 "'\'' WHERE user='\''root'\'';"}'|tail -n1|mysql -p
```

MySQL User Missing - Linux
--------------------------

If there is no MySQL user, run the following to add one for specific MySQL versions:

```
INSERT INTO `mysql`.`user` VALUES ('localhost', 'root', PASSWORD('password1234'), 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '0', '0', '0', '0');
```

note> This will have to be adjusted to be specific to your version of MySQL.

MySQL Permissions Tables Invalid - Linux
----------------------------------------

Sometimes the permissions tables are invalid. Correct with:

```
/usr/bin/mysql_fix_privilege_tables
```

