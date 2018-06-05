# Modelar-MySQL-Adapter

**This is an adapter for [Modelar](https://github.com/hyurl/modelar) to**
**connect MySQL/Maria database.**

(This module is internally included by Modelar, you don't have to download it
before using it.)

## Prerequisites

- `NodeJS` version higher than 4.0.0.

## How To Use

```javascript
const { DB } = require("modelar");

DB.init({
    type: "mysql", // Or 'maria' to connect MariaDB.
    database: "modelar",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "******"
});
```
## A Tip

When connecting to MySQL, uses `InnoDB` as engine; when connecting to MariaDB, 
uses `Aria` as engine; transactions are always enabled.

## How To Test

This module is internally included by Modelar, so are the tests, you should 
test Modelar instead (if you are going to).