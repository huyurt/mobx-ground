# Notes of T-SQL Fundamentals

## 1. Background to T-SQL Querying and Programming

### SQL

SQL has several categories of statements:

- **Data Definition Language (DDL):** object definitions `CREATE`, `ALTER`, and `DROP`,
- **Data Manipulation Language (DML):** query and modify data `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, and `MERGE`,
- **Data Control Language (DCL):** permissions `GRANT` and `REVOKE`

### Normalization

Normalization is a formal mathematical process to guarantee that each entity will be represented by a single relation. In a normalized database, you avoid anomalies during data modification and keep redundancy to a minimum without sacrificing completeness.

...

### Creating Tables

```sql
USE TSQLV4; -- The USE statement sets the current database context to that of TSQLV4.
DROP TABLE IF EXISTS dbo.Employees;

CREATE TABLE dbo.Employees(  
    empid     INT         NOT NULL,
    firstname VARCHAR(30) NOT NULL,
    lastname  VARCHAR(30) NOT NULL,
    hiredate  DATE        NOT NULL,
    mgrid     INT         NULL,
    ssn       VARCHAR(20) NOT NULL,
    salary    MONEY       NOT NULL
);
```

````sql
-- For earlier versions of SQL Server 2016
IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL DROP TABLE dbo.Employees;

-- The OBJECT_ID function accepts an object name and type as inputs.
-- The type U represents a user table. 
````

### Primary Key Constraint

````sql
ALTER TABLE dbo.Employees
	ADD CONSTRAINT PK_Employees
	PRIMARY KEY(empid);
````

### Unique Constraint

````sql
ALTER TABLE dbo.Employees
	ADD CONSTRAINT UNQ_Employees_ssn
	UNIQUE(ssn);
````

SQL Server’s implementation rejects duplicate `NULL`s. To emulate the standard unique constraint in SQL Server you can use a unique filtered index that filters only non-`NULL` values. 

````sql
CREATE UNIQUE INDEX idx_ssn_notnull ON dbo.Employees(ssn) WHEREssn IS NOT NULL;
````

### Foreign Key Constraints

This constraint is defined on one or more attributes in what’s called the referencing table and points to candidate-key (primary-key or unique-constraint) attributes in what’s called the referenced table.

````sql
DROP TABLE IF EXISTS dbo.Orders;
CREATE TABLE dbo.Orders
(
    orderid   INT         NOT NULL,
    empid     INT         NOT NULL,
    custid    VARCHAR(10) NOT NULL,
    orderts   DATETIME2   NOT NULL,
    qty       INT         NOT NULL,
    CONSTRAINT PK_Orders    PRIMARY KEY(orderid)
);
````

You can define the options `ON DELETE` and `ON UPDATE` with actions such as `CASCADE`, `SET DEFAULT`, and `SET NULL` as part of the foreign-key definition.

For `CASCADE` example, `ON DELETE CASCADE` means that when you delete a row from the referenced table, the RDBMS will delete the related rows from the referencing table.

`SET DEFAULT` and `SET NULL` mean that the compensating action will set the foreign-key attributes of the related rows to the column’s *default value* or *NULL*, respectively.

### Check Constraints

You can use a check constraint to define a predicate that a row must meet to be entered into the table or to be modified.

````sql
ALTER TABLE dbo.Employees  
	ADD CONSTRAINT CHK_Employees_salary  
	CHECK(salary > 0.00);
````

An option called `WITH NOCHECK` that tells the RDBMS you want it to bypass constraint checking for existing data. This is a bad practice because you cannot be sure your data is consistent. You can also disable or enable existing check and foreign-key constraints.

### Default Constraints

The default value when an explicit value is not specified for the attribute when you insert a row.

````sql
ALTER TABLE dbo.Orders  
	ADD CONSTRAINT DFT_Orders_orderts  
	DEFAULT(SYSDATETIME()) FOR orderts;
````

The default expression invokes the `SYSDATETIME` function,which returns the current date and time value. After this default expression is defined, whenever you insert a row in the Orders table and do not explicitly specify a value in the orderts attribute, SQL Server will set the attribute value to `SYSDATETIME`.

## 2. Single-Table Queries

 The clauses are logically processed in the following order:

1. FROM
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
   - Expressions
   - DISTINCT
6. ORDER BY
   - TOP/OFFSET-FETCH

````sql
SELECT empid, YEAR(orderdate) AS orderyear, COUNT(*)AS numorders
FROM Sales.Orders
WHERE custid = 71
GROUP BY empid, YEAR(orderdate)
HAVING COUNT(*) > 1
ORDER BY empid, orderyear;
````

 Its clauses are processed in the following order:

````sql
FROM Sales.Orders
WHERE custid = 71
GROUP BY empid, YEAR(orderdate)
HAVING COUNT(*) > 1
SELECT empid, YEAR  (orderdate) AS orderyear,
COUNT(*) AS numorders
ORDER BY empid, orderyear
````

### The `FROM` Clause

````sql
FROM Sales.Orders
````

When you don’t specify the schema name explicitly, SQL Server must resolve it implicitly based on its implicit name-resolution rules. This creates some minor cost and can result in SQL Server choosing a different object than the one you intended. By being explicit, your code is safer in the sense you ensure that you get the object you intended to get. 

### The `WHERE` Clause

The `WHERE` clause has significance when it comes to query performance. Based on what you have in the filter expression, SQL Server evaluates the use of indexes to access the required data.

Always keep in mind that T-SQL uses three-valued predicate logic, where logical expressions can evaluate to `TRUE`, `FALSE`, or `UNKNOWN`.  Only rows for which the logical expression evaluates to `TRUE` are returned by the `WHERE` phase to the subsequent logical query processing phase.

### The `GROUP` Clause

You can use the `GROUP BY` phase to arrange the rows returned by the previous logical query processing phase in groups. 

All aggregate functions ignore `NULL`s, with one exception. For example, consider a group of five rows with the values 30, 10, NULL, 10, 10 in a column called qty. The expression `COUNT(qty)` returns 4 because there are four known values.

### The `HAVING` Clause

Whereas the `WHERE` clause is a row filter, the `HAVING` clause is a group filter.

Only groups for which the `HAVING` predicate evaluates to `TRUE` are returned by the `HAVING` phase to the next logical query processing phase. Groups for which the predicate evaluates to `FALSE` `UNKNOWN` are discarded.

### The `SELECT` Clause

If by mistake you miss a comma between two column names in the `SELECT` list, code won’t fail. Instead, SQL Server will assume the second name is an alias for the first column name.

````sql
SELECT orderid orderdate
FROM Sales.Orders

-- orderdate
-- -----------
-- 10248
-- 10249
-- 10250
-- 10251
-- 10252
-- ...
````

Remember that the `SELECT` clause is processed after the `FROM`, `WHERE`, `GROUP BY`, and `HAVING` clauses. This means that aliases assigned to expressions in the `SELECT` clause do not exist as far as clauses that are processed before the `SELECT` clause are concerned:

````sql
SELECT orderid, YEAR(orderdate) AS orderyear
FROM Sales.Orders
WHERE orderyear > 2015;

-- Msg 207, Level 16, State 1, Line 3 Invalid column name 'orderyear'.
````

One way around this problem is to repeat the expression `YEAR(orderdate)` in both the `WHERE` and `SELECT` clauses:

````sql
SELECT orderid, YEAR(orderdate) AS orderyear
FROM Sales.Orders
WHERE YEAR(orderdate) > 2015;
````

Curiously, you are not allowed to refer to column aliases created in the `SELECT` clause in other expressions within the same `SELECT` clause:

````sql
SELECT orderid,
	YEAR(orderdate) AS orderyear,
	orderyear + 1 AS nextyear
FROM Sales.Orders
-- invalid
````

````sql
SELECT orderid,
	YEAR(orderdate) AS orderyear,
	YEAR(orderdate) + 1 AS nextyear
FROM Sales.Orders
-- valid
````

Also, listing column names explicitly is the recommended practice.

### The `ORDER BY` Clause

````sql
...
ORDER BY 1, 2 -- This is considered bad programming practice.
````

### The `TOP` Filter

````sql
SELECT TOP (5) orderid, orderdate, custid, empid
FROM Sales.Orders
ORDER BY orderdate DESC
````

Remember that the `ORDER BY` clause is evaluated after the `SELECT` clause, which includes the `DISTINCT` option. The same is true with the `TOP` filter, which relies on the `ORDER BY` specification to give it its filtering-related meaning. This means that if `DISTINCT` is specified in the `SELECT` clause, the `TOP` filter is evaluated after duplicate rows have been removed.

You can use the `TOP` option with the `PERCENT` keyword, in which case SQL Server calculates the number of rows to return based on a percentage of the number of qualifying rows, rounded up. For example, the following query requests the top 1 percent of the most recent orders:

````sql
SELECT TOP (1) PERCENT orderid, orderdate, custid, empid
FROM Sales.Orders
ORDER BY orderdate DESC

-- orderid     orderdate  custid      empid
-- ----------- ---------- ----------- -----------
-- 11074       2016-05-06 73          7
-- 11075       2016-05-06 68          8
-- 11076       2016-05-06 9           4
-- 11077       2016-05-06 65          1
-- 11070       2016-05-05 44          2
-- 11071       2016-05-05 46          1
-- 11072       2016-05-05 20          4
-- 11073       2016-05-05 58          2
-- 11067       2016-05-04 17          1
-- (9 row(s) affected)
````

The query returns nine rows because the Orders table has 830 rows, and 1 percent of 830, rounded up, is 9.

````sql
SELECT TOP (5) WITH TIES orderid, orderdate, custid, empid
FROM Sales.Orders
ORDER BY orderdate DESC

-- orderid     orderdate  custid      empid
-- ----------- ---------- ----------- -----------
-- 11077       2016-05-06 65          1
-- 11076       2016-05-06 9           4
-- 11075       2016-05-06 68          8
-- 11074       2016-05-06 73          7
-- 11073       2016-05-05 58          2
-- 11072       2016-05-05 20          4
-- 11071       2016-05-05 46          1
-- 11070       2016-05-05 44          2
-- (8 row(s) affected)
````

### The `OFFSET-FETCH` Filter

The `OFFSET-FETCH` filter is considered an extension to the `ORDER BY` clause. With the `OFFSET` clause you indicate how many rows to skip, and with the `FETCH` clause you indicate how many rows to filter after the skipped rows.

````sql
SELECT orderid, orderdate, custid, empid
FROM Sales.Orders
ORDER BY orderdate, orderid
OFFSET 50 ROWS FETCH NEXT 25 ROWS ONLY
````

### A Quick Look At Window Functions

````sql
SELECT orderid, custid, val,
	ROW_NUMBER() OVER(PARTITION BY custid
                      ORDER BY val) AS rownum
FROM Sales.OrderValues
ORDER BY custid, val

-- orderid     custid      val      rownum
-- ----------- ----------- -------- -----------------------------
-- 10702       1           330.00   1
-- 10952       1           471.20   2
-- 10643       1           814.50   3
-- 10835       1           845.80   4
-- 10692       1           878.00   5
-- 11011       1           933.50   6
-- 10308       2           88.80    1
-- 10759       2           320.00   2
-- 10625       2           479.75   3
-- 10926       2           514.40   4
-- 10682       3           375.50   1
-- ...
-- (830 row(s) affected)
````

The `ROW_NUMBER` function assigns unique, sequential, incrementing integers to the rows in the result within the respective partition, based on the indicated ordering. The `OVER` clause in this example function partitions the window by the _custid_ attribute; hence, the row numbers are unique to each customer. The `OVER` clause also defines ordering in the window by the _val_ attribute, so the sequential row numbers are incremented within the partition based on the values in this attribute.

`ROW_NUMBER` function must produce unique values within each partition. This means that even when the ordering value doesn’t increase, the row number still must increase. Therefore, if the `ROW_NUMBER` function’s `ORDER BY` list is non-unique, as in the preceding example, the query is nondeterministic. That is, more than one correct result is possible. If you want to make a row number calculation deterministic, you must add elements to the `ORDER BY` list to make it unique.

### Predicates and Operators

Examples of predicates: `IN`, `BETWEEN`, `LIKE`

````sql
SELECT orderid, empid, orderdate FROM Sales.Orders WHERE orderid IN(10248, 10249, 10250);
SELECT orderid, empid, orderdate FROM Sales.Orders WHERE orderid BETWEEN 10300 AND 10310;
SELECT empid, firstname, lastname FROM HR.Employees WHERE lastname LIKE N'D%';
````

Notice the use of the letter _N_ to prefix the string _‘D%’_; it stands for _National_ and is used to denote that a character string is of a Unicode data type (_NCHAR_ or _NVARCHAR_), as opposed to a regular character data type (_CHAR_ or _VARCHAR_). Because the data type of the _lastname_ attribute is _NVARCHAR(40)_, the letter _N_ is used to prefix the string.

Comparison operators:  =, >, <, >=, <=, <>, !=, !>, !<, of which the last three are not standard.

Logical operators: _AND_, _OR_, and _NOT_

Arithmetic operators: +, -, *, /, and %

Two integer columns, as in _col1/col2_, you need to cast the operands to the appropriate type if you want the calculation to be a numeric one: _CAST(col1 AS NUMERIC(12, 2))/CAST(col2 AS NUMERIC(12, 2))_. The data type _NUMERIC(12, 2)_ has a precision of 12 and a scale of 2, meaning that it has 12 digits in total, 2 of which are after the decimal point.

If the two operands are of different types, the one with the lower precedence is promoted to the one that is higher. For example, in the expression 5/2.0, the first operand is _INT_ and the second is _NUMERIC_. Because _NUMERIC_ is considered higher than _INT_, the _INT_ operand 5 is implicitly converted to the _NUMERIC_ 5.0 before the arithmetic operation, and you get the result 2.5.

The following list describes the precedence among operators, from highest to lowest:

1. ( ) (Parentheses)
2. \* (Multiplication), / (Division), % (Modulo)
3. \+ (Positive), – (Negative), + (Addition), + (Concatenation), – (Subtraction)
4. =, >, <, >=, <=, <>, !=, !>, !< (Comparison operators)
5. NOT
6. AND
7. BETWEEN, IN, LIKE, OR
8. = (Assignment)

### `CASE` Expressions

A `CASE` expression is a scalar expression that returns a value based on conditional logic. `CASE` is an expression and not a statement; that is, it doesn’t take action such as controlling the flow of your code. Instead, it returns a value. Because `CASE` is a scalar expression, it is allowed wherever scalar expressions are allowed, such as in the `SELECT`, `WHERE`, `HAVING`, and `ORDER BY` clauses and in `CHECK` constraints.

There are two forms of `CASE` expressions: simple and searched. You use the simple form to compare one value or scalar expression with a list of possible values and return a value for the first match. If no value in the list is equal to the tested value, the `CASE` expression returns the value that appears in the `ELSE` clause (if one exists). If the `CASE` expression doesn’t have an `ELSE` clause, it defaults to `ELSE` `NULL`.

````sql
SELECT orderid, custid, val,
		CASE
		WHEN val < 1000.00                   THEN 'Less than1000'
		WHEN val BETWEEN 1000.00 AND 3000.00 THEN 'Between 1000and 3000'
		WHEN val > 3000.00                   THEN 'More than3000'
		ELSE 'Unknown'
	END AS valuecategory
FROM Sales.OrderValues;
````

T-SQL supports some functions you can consider as abbreviations of the `CASE` expression: `ISNULL`, `COALESCE`, `IIF`, and `CHOOSE`. Only `COALESCE` is standard.

The function `IIF(<logical_expression>, <expr1>, <expr2>)` returns _expr1_ if _logical_expression_ is `TRUE`, and it returns _expr2_ otherwise:

````sql
IIF(col1 <> 0, col2/col1, NULL)
````

 The function `CHOOSE(<index>, <expr1>, <expr2>, ..., <exprn>)` returns the expression from the list in the specified index.

````sql
CHOOSE(3, col1, col2, col3)
````

### `NULL`s

SQL supports the `NULL` marker to represent missing values and uses three-valued predicate logic, meaning that predicates can evaluate to `TRUE`, `FALSE`, or `UNKNOWN`.

A logical expression involving only non-`NULL` values evaluates to either `TRUE` or `FALSE`. When the logical expression involves a missing value, it evaluates to `UNKNOWN`. For example, consider the predicate _salary > 0_. When salary is equal to 1,000, the expression evaluates to `TRUE`. When salary is equal to –1,000, the expression evaluates to `FALSE`. When salary is `NULL`, the expression evaluates to `UNKNOWN`.

#### All-at-once operations

````sql
SELECT col1, col2
FROM dbo.T1
WHERE col1 <> 0 AND col2/col1 > 2
````

You might very well assume SQL Server evaluates the expressions from left to right, and that if the expression _col1 <> 0_ evaluates to `FALSE`, SQL Server will short-circuit—that is, that it won’t bother to evaluate the expression _10/col1 > 2_ because at this point it is known that the whole expression is `FALSE`. So you might think that this query should never produce a divide-by-zero error. SQL Server does support short circuits, but because of the all-at-once operations concept, it is free to process the expressions in the `WHERE` clause in any order. SQL Server usually makes decisions like this based on cost estimations. You can see that if SQL Server decides to process the expression _10/col1 > 2_ first, this query might fail because of a divide-by-zero error.

### Working with Character Data

#### Data types

- Regular: `CHAR` and `VARCHAR` (1 byte per character)
- Unicode: `NCHAR` and `NVARCHAR` (2 bytes per character)

Any data type without the `VAR` element (`CHAR`, `NCHAR`) in its name has a fixed length. A data type with the `VAR` element (`VARCHAR`, `NVARCHAR`) in its name has a variable length.

#### Collation

`COLLATE`: Language support, sort order, case sensitivity, accent sensitivity, and more.

````sql
SELECT name, description
FROM sys.fn_helpcollations() -- To get the set of supported collations and their descriptions
````

- _Latin1_General_
- _Dictionary sorting_ (A and a < B and b)
- _CI_: Case insensitive (a = A)
- _AS_: Accent sensitive (à <> ä)

````sql
SELECT empid, firstname, lastname FROM HR.Employees WHERE lastname = N'davis'
-- empid       firstname  lastname
-- ----------- ---------- ---------
-- 1           Sara       Davis

SELECT empid, firstname, lastname FROM HR.Employees
WHERE lastname COLLATE Latin1_General_CS_AS = N'davis'
-- Not returned any value
````

#### Operators and functions

For string concatenation, T-SQL provides the plus-sign (+) operator and the `CONCAT` function.

Operations on character strings: `SUBSTRING`, `LEFT`, `RIGHT`, `LEN`, `DATALENGTH`, `CHARINDEX`, `PATINDEX`, `REPLACE`, `REPLICATE`, `STUFF`, `UPPER`, `LOWER`, `RTRIM`, `LTRIM`, `FORMAT`, `COMPRESS`, `DECOMPRESS`, and `STRING_SPLIT`.

##### String concatenation (plus-sign [+] operator and `CONCAT` function)

````sql
SELECT custid, country, region, city,
	country + N',' + region + N',' + city AS location
FROM Sales.Customers

-- custid      country         region  city            location
-- ----------- --------------- ------- --------------- -------------------
-- 1           France          NULL    Marseille       NULL
-- 2           Canada          BC      Tsawwassen      Canada,BC,Tsawwassen
-- 3           UK              NULL    London          NULL
-- 4           Switzerland     NULL    Bern            NULL
-- 5           Brazil          SP      Sao Paulo       Brazil,SP,Sao Paulo
-- 6           UK              NULL    London          NULL
-- 7           Germany         NULL    Aachen          NULL
````

`CONCAT` that accepts a list of inputs for concatenation and automatically substitutes `NULL`s with empty strings. For example, the expression `CONCAT(‘a’, NULL, ‘b’)` returns the string ‘ab’.

````sql
SELECT custid, country, region, city,
	CONCAT(country, N',' + region, N',' + city) AS location
FROM Sales.Customers
````

##### The `SUBSTRING` function

`SUBSTRING(string, start, length)`: If the value of the third argument exceeds the end of the input string, the function returns everything until the end without raising an error.

````sql
SELECT SUBSTRING('abcde', 1, 3) -- abc
````

##### The `LEFT` and `RIGHT` functions

`LEFT(string, n)`, `RIGHT(string, n)` : _n_, is the number of characters to extract from the left or right end of the string. 

````sql
SELECT RIGHT('abcde', 3) -- cde
````

##### The `LEN` and `DATALENGTH` functions

````sql
SELECT LEN(N'abcde') -- 5
SELECT DATALENGTH(N'abcde') -- 10 -> returns bytes
````

##### The `CHARINDEX` function

`CHARINDEX(substring, string[, start_pos])`: If the substring is not found, the function returns 0.

````sql
SELECT CHARINDEX(' ','Itzik Ben-Gan') -- 6
````

##### The `PATINDEX` function

`PATINDEX(pattern, string)`

````sql
SELECT PATINDEX('%[0-9]%', 'abcd123efgh') -- 5
````

##### The `REPLACE` function

`REPLACE(string, substring1, substring2)`

````sql
SELECT REPLACE('1-a 2-b', '-', ':') -- 1:a 2:b
````

##### The `REPLICATE` function

`REPLICATE(string, n)`

````sql
SELECT REPLICATE('abc', 3) -- abcabcabc

SELECT supplierid,
	RIGHT(REPLICATE('0', 9) + CAST(supplierid AS VARCHAR(10)), 10) AS strsupplierid
FROM Production.Suppliers
-- supplierid  strsupplierid
-- ----------- -------------
-- 29          0000000029
-- 28          0000000028
-- 4           0000000004
-- 21          0000000021
-- 2           0000000002
````

`FORMAT` that you can use to achieve such formatting needs much more easily, though at a higher cost.

##### The `STUFF` function

`STUFF(string, pos, delete_length, insert_string)`

````sql
SELECT STUFF('xyz', 2, 1, 'abc') -- xabcz
````

##### The `UPPER` and `LOWER` functions

`UPPER(string), LOWER(string)`

````sql
SELECT UPPER('Itzik Ben-Gan') -- ITZIK BEN-GAN
SELECT LOWER('Itzik Ben-Gan') -- itzik ben-gan
````

##### The `RTRIM` and `LTRIM` functions

`RTRIM(string), LTRIM(string)`

````sql
SELECT RTRIM(LTRIM('   abc   ')) -- abc
````

##### The `FORMAT` function

`FORMAT(input , format_string, culture)`

````sql
SELECT FORMAT(1759, '000000000') -- 0000001759
````

The `COMPRESS` and `DECOMPRESS` functions

`COMPRESS(string), DECOMPRESS(string)`: GZIP algorithm to compress and decompress the input, respectively.

The `COMPRESS` function accepts a character or binary string as input and returns a compressed `VARBINARY(MAX)` typed value. The `DECOMPRESS` function accepts a binary string as input and returns a decompressed `VARBINARY(MAX)` typed value.

````sql
SELECT DECOMPRESS(COMPRESS(N'This is my cv. Imagine it was much longer.'));
````

##### The `STRING_SPLIT` function

`SELECT value FROM STRING_SPLIT(string, separator)`

````sql
SELECT CAST(value AS INT) AS myvalue
FROM STRING_SPLIT('10248,10249,10250', ',') AS S

-- myvalue
-- -----------
-- 10248
-- 10249
-- 10250
````

##### The `LIKE` predicate

###### The % (percent) wildcard

````sql
SELECT empid, lastname FROM HR.Employees WHERE lastname LIKE N'D%'

-- empid       lastname
-- ----------- --------------------
-- 1           Davis
-- 9           Doyle
````

###### The _ (underscore) wildcard

````sql
SELECT empid, lastname FROM HR.Employees WHERE lastname LIKE N'_e%'

-- empid       lastname
-- ----------- --------------------
-- 3           Lew
-- 4           Peled
````

###### The [\<list of characters>] wildcard

````sql
SELECT empid, lastname FROM HR.Employees WHERE lastname LIKE N'[ABC]%'

-- empid       lastname
-- ----------- --------------------
-- 8           Cameron
````

###### The [\<character>-\<character>] wildcard

````sql
SELECT empid, lastname FROM HR.Employees WHERE lastname LIKE N'[A-E]%'

-- empid       lastname
-- ----------- --------------------
-- 8           Cameron
-- 1           Davis
-- 9           Doyle
````

###### The \[^\<character list or range>] wildcard

````sql
SELECT empid, lastname
FROM HR.Employees
WHERE lastname LIKE N'[^A-E]%'

-- empid       lastname
-- ----------- --------------------
-- 2           Funk
-- 7           King
-- 3           Lew
-- 5           Mortensen
-- 4           Peled
-- 6           Suurs
````

###### The ESCAPE character

If you want to search for a character that is also used as a wildcard (such as %, _, [, or ]), you can use an escape character.

#### Working with date and time data

##### Date and time data types

Two legacy types called `DATETIME` and `SMALLDATETIME`, and four later additions called `DATE`, `TIME`, `DATETIME2`, and `DATETIMEOFFSET`.

| Data type      | Storage (bytes) | Date range                        | Accuracy           | Entry Format and Example                                     |
| -------------- | --------------- | --------------------------------- | ------------------ | ------------------------------------------------------------ |
| DATETIME       | 8               | January 1, 1753 December 31, 9999 | 3 1/3 milliseconds | 'YYYYMMDD hh:mm:ss.nnn' '20200215 10:36:44.839'              |
| SMALLDATETIME  | 4               | January 1, 1990 June 6, 2079      | 1 minute           | 'YYYYMMDD hh:mm' '20200215 10:36'                            |
| DATE           | 3               | January 1, 0001 December 31, 9999 | 1 day              | 'YYYY-MM-DD' '2020-02-15'                                    |
| TIME           | 3 to 5          | N/A                               | 100 nanoseconds    | 'hh:mm:ss.nnnnnnn' '10:36:44.8391567'                        |
| DATETIME2      | 6 to 8          | January 1, 0001 December 31, 9999 | 100 nanoseconds    | 'YYYY-MM-DD hh:mm:ss:nnnnnnn' '2020-02-15 10:36:44.8391567'  |
| DATETIMEOFFSET | 8 to 10         | January 1, 0001 December 31, 9999 | 100 nanoseconds    | 'YYYY-MM-DD hh:mm:ss:nnnnnnn [+\|-]hh:mm' '2020-02-15 10:36:44:8391567 +02:00' |

The storage requirements for `TIME`, `DATETIME2`, and `DATETIMEOFFSET` depend on the precision you choose. You specify a fractional-second precision as an integer in the range 0 to 7.

##### Literals

When you need to specify a literal (constant) of a date and time data type.

````sql
SET LANGUAGE British;
SELECT CAST('02/12/2016' AS DATE) -- 2016-12-02
SELECT CAST('20160212' AS DATE) -- 2016-02-12

SET LANGUAGE us_english;
SELECT CAST('02/12/2016' AS DATE) -- 2016-02-12
SELECT CAST('20160212' AS DATE) -- 2016-02-12
````

| Data type      | Accuracy                                                     | Entry Format and Example                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| DATETIME       | 'YYYYMMDD hh:mm:ss.nnn' 'YYYY-MM-DDThh:mm:ss.nnn' 'YYYYMMDD' | '20200215 10:36:44.839' '2020-02-15T10:36:44.839' '20200215' |
| SMALLDATETIME  | 'YYYYMMDD hh:mm' 'YYYY-MM-DDThh:mm' 'YYYYMMDD'               | '20200215 10:36' '2020-02-15T10:36' '20200215'               |
| DATE           | 'YYYYMMDD' 'YYYY-MM-DD'                                      | '20200215' '2020-02-15'                                      |
| DATETIME2      | 'YYYYMMDD hh:mm:ss.nnnnnnn' 'YYYY-MM-DD hh:mm:ss.nnnnnnn' 'YYYY-MM-DDThh:mm:ss.nnnnnnn' 'YYYYMMDD' 'YYYY-MM-DD' | '20200215 10:36:44.8391567' '2020-02-15 10:36:44.8391567' '2020-02-15T10:36:44.8391567' '20200215' '2020-02-15' |
| DATETIMEOFFSET | 'YYYYMMDD hh:mm:ss.nnnnnnn [+\|-]hh:mm' 'YYYY-MM-DD hh:mm:ss.nnnnnnn [+\|-]hh:mm' 'YYYYMMDD' 'YYYY-MM-DD' | '20200215 10:36:44.8391567 +02:00' '2020-02-15 10:36:44.8391567 +02:00' '20200215' '2020-02-15' |
| TIME           | 'hh:mm:ss.nnnnnnn'                                           | '10:36:44.8391567'                                           |

````sql
SELECT CONVERT(DATE, '02/12/2016', 101) -- February 12, 2016
SELECT CONVERT(DATE, '02/12/2016', 103) -- December 02, 2016
SELECT PARSE('02/12/2016' AS DATE USING 'en-US')
SELECT PARSE('02/12/2016' AS DATE USING 'en-GB')
````

The `PARSE` function is significantly more expensive than the `CONVERT` function.

##### Working with date and time separately

