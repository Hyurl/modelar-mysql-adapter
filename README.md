# Modelar-MySQL-Adapter

**This is an adapter for [Modelar](http://modelar.hyurl.com) to connect**
**MySQL/Maria database.**
(This module is internally included by Modelar, you don't have to download it
before using it.)

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

When connect to MySQL, uses `InnoDB` as engine; when connect to MariaDB, uses 
`Aria` as engine; transactions are always enabled.