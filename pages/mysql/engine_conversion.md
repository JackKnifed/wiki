author: jack
topic: mysql
title: Engine Conversion


Engine Conversion
=================

### Manual Conversion ###

Alter a specific table - possible engines include `InnoDB` `MyISAM` and `MEMORY`

```mysql
ALTER TABLE `database`.`table` ENGINE = InnoDB;
```

### Table Engine statement ###

notice> Please backup the current engines first so things can be restored.

Running the following command will backup the current engine of each table. You need to do this before running either statements from below:

```bash
mysql -Bse 'SELECT CONCAT("ALTER TABLE ",table_schema,".",table_name," ENGINE=",Engine,";") FROM information_schema.tables WHERE table_schema NOT IN("mysql","information_schema","performance_schema");' > engine_backup.sql
```

To restore this, import this file into MySQL, sans database:

```bash
mysql < engine_backup.sql
```

### Convert a Specific Database to An Engine ###

```bash
echo 'database? then engine?'; read db; read tbleng; echo SELECT CONCAT\(\"ALTER TABLE \`\", TABLE_SCHEMA, \"\`.\`\", TABLE_NAME, \"\` ENGINE = ${tbleng}\;\"\) FROM information_schema.TABLES WHERE Engine NOT LIKE \"${tbleng}\" AND TABLE_SCHEMA = \"${db}\"\;|mysql -Bs|mysql -f
```

### Convert all MyISAM to InnoDB ###

notice> If any tables have features that are not supported by InnoDB, those tables will fail with a warning. For instance, MySQL before 5.6, if there's a `FULLTEXT` index present, that will give an error.

```bash
mysql -Bse 'SELECT CONCAT("ALTER TABLE `", TABLE_SCHEMA, "`.`", TABLE_NAME, "` ENGINE = InnoDB;") FROM information_schema.TABLES WHERE Engine = "MyISAM" AND TABLE_SCHEMA NOT IN ("mysql", "performance_schema", "information_schema");'|mysql -f
```

The above command will keep going if a table fails to convert.

warning> For cPanel servers, use the following instead. (more databases are excluded)

```bash
mysql -Bse 'SELECT CONCAT("ALTER TABLE `", TABLE_SCHEMA, "`.`", TABLE_NAME, "` ENGINE = InnoDB;") FROM information_schema.TABLES WHERE Engine = "MyISAM" AND TABLE_SCHEMA NOT LIKE "logaholicDB%" AND TABLE_SCHEMA NOT IN ("mysql", "performance_schema", "information_schema", "roundcube", "eximstats", "modsec", "whmxfer", "cphulkd", "leechprotect");'|mysql -f
```

### Convert all InnoDB to MyISAM ###

```bash
mysql -Bse 'SELECT CONCAT("ALTER TABLE ",table_schema,".",table_name," ENGINE=MyISAM;") FROM information_schema.tables WHERE table_schema NOT IN ("mysql","information_schema","performance_schema") AND Engine = "InnoDB";' | mysql -Bs
```
notice> If any tables have features that are not supported by MyISAM, those tables will fail with a warning. For instance, MyISAM does not support foreign key constraints, so any tables with these will fail.