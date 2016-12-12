topic: mysql
topic: centos
topic: ubuntu
author: jack
title: mysql grants

MySQL Grants
============

ok> Permissions are granted in MySQL, thus they're called grants.

notice> Permissions should not be modified directly on cPanel servers. Grant permissions through WHM/cPanel.

MySQL Users
-----------

A MySQL user is made up of a username and a location - two distinct parts. All of the following are distinct users. Each user has a password.

* `bob`@`localhost`
* `sue`@`localhost`
* `bob`@`host.domain.com`
* `bob`@`10.10.10.10`
* `bob`@`10.10.%`
* `bob`@`%`
* `bob`@`127.0.0.1`
* `bob`@`localhost`

ok> `%` is the wildcard character, that part can be anything that matches.

Instead, looking at a query:

```mysql
SELECT user, host, password FROM mysql.user;
+---------------+------------------------------------+-------------------------------------------+
| user          | host                               | password                                  |
+---------------+------------------------------------+-------------------------------------------+
| root          | localhost                          | *B145E398D3DCFFFE82B2DC502E28AAC590EC07FF | 
| root          | 101.dc2-vps-template.liquidweb.com | *B145E398D3DCFFFE82B2DC502E28AAC590EC07FF | 
| root          | 127.0.0.1                          | *B145E398D3DCFFFE82B2DC502E28AAC590EC07FF | 
| leechprotect  | localhost                          | *E8057E90AB8D4E51239A06C87FF1007ECEEB5414 | 
| eximstats     | localhost                          | *4C78EFC745475E0748EC4EBA1EB9901D83C4C880 | 
| cphulkd       | localhost                          | *11FB5E15B6989F4F33181104BB303B7E4C226DE3 | 
| cpldap        | localhost                          | *61697BCBA52977DFF38254BF1723AF2240039A65 | 
| roundcube     | localhost                          | *945077E9B53337701826CC615E128D3BD3102495 | 
| horde         | localhost                          | *15FB21CA888B3182E17B01102EC6CBE7B45BCE81 | 
| modsec        | localhost                          | *65E12BD8940E523B6C35780D0B255C1E300475B0 | 
| jhayhurs      | localhost                          | *B2EE6F1F6C7712CF4D2B38EC8A4BE9759E2EF63F | 
| jhayhurs      | 192.168.1.%                        | *B2EE6F1F6C7712CF4D2B38EC8A4BE9759E2EF63F | 
| imscared      | localhost                          | 06e0a7e85fb72a63                          | 
| mail          | localhost                          | 29fc7d4049d4cdfb                          | 
| jhayhurs_rage | localhost                          | *E0A58E1FFFD420C25B63DE31B705C995304B12C1 | 
| jhayhurs_rage | 192.168.1.%                        | *E0A58E1FFFD420C25B63DE31B705C995304B12C1 | 
+---------------+------------------------------------+-------------------------------------------+
16 rows in set (0.00 sec)
```

Basic Grants View
-----------------

```mysql
mysql> show grants;
+----------------------------------------------------------------------------------------------------------------------------------------+
| Grants for root@localhost                                                                                                              |
+----------------------------------------------------------------------------------------------------------------------------------------+
| GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY PASSWORD '*B145E398D3DCFFFE82B2DC502E28AAC590EC07FF' WITH GRANT OPTION | 
+----------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

To see grants for someone else:

```mysql
show grants for root@localhost;
+----------------------------------------------------------------------------------------------------------------------------------------+
| Grants for root@localhost                                                                                                              |
+----------------------------------------------------------------------------------------------------------------------------------------+
| GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY PASSWORD '*B145E398D3DCFFFE82B2DC502E28AAC590EC07FF' WITH GRANT OPTION | 
+----------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

* No host -> host is wildcard

Permissions Tables
------------------

MySQL stores it's permissions in certain tables, all in the database `mysql`. You can get at those tables. Once you have permission to do something, it's yours.

* `user` - server wide permissions for that user
* `host` - server wide permissions for a specific location
* `db` - database wide permissions for a user
* `tables_priv` - table wide permission for a user
* `columns_priv` - column specific permissions

notice> For preformance reasons, it's recommended you stick to `user`, `host`, and `db` for your permissions.

As an added thing, the `user` table contains some additional things:

* the hashed password for that user
* SSL/x509 encryption settings
* super privileges (like `uid 0`)

Granting Super
--------------

```mysql
GRANT SUPER ON *.* to 'username'@'localhost';
```

Create a user
-------------

```mysql
CREATE USER 'jack'@'localhost' IDENTIFIED BY 'mypass';
```

```mysql
CREATE USER 'jack'@'%' IDENTIFIED BY 'mypass';
```

```mysql
CREATE USER 'jack'@'69.16.222.127' IDENTIFIED BY 'mypass';
```

On MySQL 4, or to do it manually:

```mysql
GRANT ALL ON mydb.* TO 'someuser'@'somehost' IDENTIFIED BY PASSWORD 'mysecretpass';
FLUSH PRIVILEGES;
```

Change a Password
-----------------

```mysql
SET PASSWORD FOR 'Jack'@'localhost' = PASSWORD('newpass');
```

You can modify things directly too:

```mysql
UPDATE mysql.user SET Password=PASSWORD('newpass')
  WHERE User='Jack' AND Host='localhost';
FLUSH PRIVILEGES;
```

Granting Access
---------------

To give a user full access to a database:

```mysql
GRANT ALL
	ON lwtest.*
	TO 'somebody'@'localhost';
```

To give a user limited access to a database:

```mysql
GRANT SELECT,INSERT,UPDATE,DELETE
	ON lwtest.*
	TO 'somebody'@'localhost';
```

What if you only want one table?

```mysql
GRANT SELECT,INSERT,UPDATE,DELETE
	ON lwtest.sometable
	TO 'somebody'@'localhost';
```

Advanced Usage
--------------

As previously mentioned, all permissions are stored in `mysql`. Go muck with it directly.