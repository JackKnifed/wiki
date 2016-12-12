author: jack
topic: mysql
topic: training
title: SQL Syntax

SQL Syntax
==========

SQL query syntax is fairly standard. We are going to cover the SELECT query first.

Query Order
-----------

`SELECT` queries have 7 major clauses that must appear in the following order. None are required unless needed.

* `SELECT`
* `FROM`
* `WHERE`
* `GROUP BY`
* `HAVING`
* `ORDER BY`
* `LIMIT`

MySQL processes them in a different order.

* `WHERE`
* `FROM`
* `GROUP BY`
* `ORDER BY`
* `SELECT`
* `HAVING`
* `LIMIT`

They are covered as they are processed.

info> Objects in MySQL are surrounded by backticks, or `\``. Strings are surrounded by quotes - either `'` or `"`.

WHERE
-----

The `WHERE` clause is the first clause applied. Think of it as a filter - as tables are loaded with the `FROM` clause, they are filtered out if this evaulates to false.

FROM
----

The `FROM` clause determines what tables to query. You may specify multiple tables by using a `JOIN` statement. The standard syntax is:

```mysql
FROM table_one
	JOIN table_two
	ON (table_one.id = table_two.table_one_id)
```

* A naked `JOIN`, or `INNER JOIN` returns rows where both tables have a value that satisifies that match.

* A `LEFT JOIN` returns all rows where both tables have a match, and all rows in the left table.

* A `RIGHT JOIN` returns all rows where both tables have a match, and all rows in the right table.

* A `FULL JOIN` returns all rows from both tables, lining them up if they do match.

You may daisy chain multiple tables together - as many as you want.

If you want to refer to the tables with a different name, you may. 

```mysql
FROM `table_one` as 't1'
	JOIN `table_two` as 't2'
		ON (`t1`.`id` = `t2`.`table_one_id`)
```

If you had a table of employees, it might look like:

| id | name  | boss | salary |
|----|-------|------|--------|
| 42 | Dick  | 11   | 30000  |
| 41 | Tom   | 11   | 30000  |
| 63 | Jane  | 11   | 40000  |
| 11 | Bobby | 14   | 60000  |
| 14 | Sue   |      | 80000  |

If you wanted to figure out everyone's boss, you could run:

```mysql
FROM `employees` as 'emp1'
	JOIN `employees` as 'emp2'
	ON (`emp1`.`boss` = `emp2`.`id`)
```

GROUP BY
--------

The `GROUP BY` clause comes after all tables have been merged with the `FROM` clause.

The `GROUP BY` reorders the results to put columns with the same values together. If multiple columns are given, the first value has all of it's columns together, and values from the second column are grouped together among the same values from the first column.

ORDER BY
--------

`ORDER BY` comes next. The rows are sorted as defined by the `ORDER BY` clause, but without disrupting the grouping from the `GROUP BY` clause.

You may use the `DESC` keyword to invert the sort order. `ASC` or ascending order is the default.

SELECT
------

The `SELECT` query is the last bit. In here, you choose what to display, and how to format it.

```mysql
SELECT `emp`.`name` as 'Name',
	`emp`.`salary` * 0.2 as 'Bonus',
	CONCAT(`boss`.`name`, " is ", `emp`.`name`, "'s boss")
FROM `employees` as 'emp'
	LEFT JOIN `employees` as 'boss'
		ON (`emp`.`id` = `boss`.`id`)
```

info> The `SELECT` clause is only preformed at query time. It cannot be stored in an index. Index lookups cannot go past the `SELECT` clause.

HAVING
------

The `HAVING` clause is like another `WHERE` clause, except for two distinctions.

* Because it's after the `SELECT` clause, it filters the formatted output.
* Because it's after the `SELECT` clause, Indexes cannot be used to speed this up.

If you can, you want to filter your query in the `WHERE` clause. If you cannot, you should probably consider filtering in code instead of using the `HAVING` clause to filter.

LIMIT
-----

The last major clause is the `LIMIT` clause. If MySQL is reading out rows in order, it reads them out until it has this many results, then prints them.

If MySQL cannot read out the results of the query in order, it has to read a chunk of rows (probably a few thousand) to make sure it has enough, filter and merge as needed, and then can finally print out those rows.

Indentation/Formatting
----------------------

Standard SQL query formatting makes for more consistent query comprehension. Hence, queries are formatted following these rules:

* SQL keywords are always capitalized.
* Each major claus begins it's own line, with no indentation.
* Secondary Clauses, or comma seperated items go on their own line, with a tab prepended.
* Tertiary clauses (defined by relation to secondary clauses) get two tabs prepended.
* A sub-query has the bounding grammer at the same level of indentation.
* The sub-query is all indented one level past the bounding grammar.

Various examples are listed on this page.

`INSERT` Query
--------------

The `INSERT` query is actually fairly basic - you specify the table to insert the rows into, and the values to insert.

```mysql
INSERT INTO shop
	(`id`, `name`, `category`, `price`)
VALUES  (1,'A',3.45),
  (1,'B',3.99),
  (2,'A',10.99),
  (3,'B',1.45),
  (3,'C',1.69),
  (3,'D',1.25),
	(4,'D',19.95);
```

You don't have to specify the column names, but you should.

You can also pull data from one database, and insert it into another. This is just an extension of the `SELECT` query.

```mysql
INSERT INTO copyTable
SELECT *
FROM originalTable
```

`UPDATE` Query
--------------

The `UPDATE` changes rows. Clauses are `UPDATE`, `SET`, `WHERE`, `ORDER BY`, and `LIMIT`. `ORDER BY` and `LIMIT` are not available when updating multiple tables.


```mysql
UPDATE single_table
SET col1 = "value",
	col2 = REPLACE("apple", "banana", col2)
WHERE id < 500
ORDER BY id
LIMIT 10
```

```mysql
UPDATE `employee` AS t1, `desk` AS t2
SET `t2`.`deskOwner` = NULL,
	`t1`.`desk` = NULL
WHERE `t1`.`id` IN (453, 23, 485, 123, 80)
```

`DELETE` Query
--------------

The `DELETE` query removes any rows from a table that match the parameters you give.

The valid clauses are `DELETE`, `FROM`, `WHERE`, `ORDER BY`, and `LIMIT`.

The single table form looks like the following, the 10 lowest items for `col3` matching the `WHERE` clause would be removed.

```mysql
DELETE
FROM `table` as 't'
WHERE `t`.`col1` = 5
	AND `t`.`col2` > 4
ORDER BY `t`.`col3`
LIMIT 10
```

An example of the multiple table form is below. In this query, matched rows are removed from employee and workstation

```mysql
DELETE `emp`, `wks` 
FROM `employee` as 'emp',
	JOIN `workstation` as 'wks'
		ON (`emp`.`wksid` = `wks`.`id`)
	JOIN ON `buildings` as 'bld'
		ON (`wks`.`bldid` = `bld`.`id`)
WHERE `emp`.`name` = "bob"
```


`CREATE` and `DROP`
-------------------

`CREATE` is how you create tables and databases, `DROP` is how you remove them.

```mysql
CREATE DATABASE test_db;
```

```mysql
CREATE TABLE t1 (
    c1 INT STORAGE DISK,
    c2 INT STORAGE MEMORY
) ENGINE InnoDB;
```

```mysql
DROP TABLE test_table;
DROP DATABASE test_db;
```

