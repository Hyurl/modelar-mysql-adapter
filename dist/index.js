"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
const modelar_1 = require("modelar");
class MysqlAdapter extends modelar_1.Adapter {
    connect(db) {
        var dsn = db.dsn, config = db.config;
        if (MysqlAdapter.Pools[dsn] === undefined) {
            let _config = Object.assign({}, config);
            _config.connectionLimit = config.max;
            MysqlAdapter.Pools[dsn] = mysql_1.createPool(_config);
        }
        return new Promise((resolve, reject) => {
            MysqlAdapter.Pools[dsn].getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.connection = connection;
                    resolve(db);
                }
            });
        });
    }
    query(db, sql, bindings) {
        return new Promise((resolve, reject) => {
            let options = {
                sql: sql,
                values: bindings,
                timeout: db.config.timeout,
            };
            this.connection.query(options, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (res instanceof Array) {
                        let data = [];
                        for (let row of res) {
                            data.push(Object.assign({}, row));
                        }
                        db.data = data;
                    }
                    else {
                        db.insertId = res.insertId;
                        db.affectedRows = res.affectedRows;
                    }
                    resolve(db);
                }
            });
        });
    }
    release() {
        if (this.connection) {
            this.connection.release();
            this.connection = null;
        }
    }
    close() {
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    }
    static close() {
        for (let i in MysqlAdapter.Pools) {
            MysqlAdapter.Pools[i].end();
            delete MysqlAdapter.Pools[i];
        }
    }
    getDDL(table) {
        let numbers = ["int", "integer"];
        let columns = [];
        let foreigns = [];
        let primary;
        let autoIncrement;
        for (let key in table.schema) {
            let field = table.schema[key];
            if (field.primary && field.autoIncrement) {
                if (!numbers.includes(field.type.toLowerCase())) {
                    field.type = "int";
                    if (!field.length)
                        field.length = 10;
                }
                autoIncrement = " auto_increment=" + field.autoIncrement[0];
            }
            if (field.length instanceof Array) {
                field.type += "(" + field.length.join(",") + ")";
            }
            else if (field.length) {
                field.type += "(" + field.length + ")";
            }
            let column = table.backquote(field.name) + " " + field.type;
            if (field.primary)
                primary = field.name;
            if (field.autoIncrement)
                column += " auto_increment";
            if (field.default === null)
                column += " default null";
            else if (field.default !== undefined)
                column += " default " + table.quote(field.default);
            if (field.notNull)
                column += " not null";
            if (field.unsigned)
                column += " unsigned";
            if (field.unique)
                column += " unique";
            if (field.comment)
                column += " comment " + table.quote(field.comment);
            if (field.foreignKey.table) {
                let foreign = `foreign key (${table.backquote(field.name)})` +
                    " references " + table.backquote(field.foreignKey.table) +
                    " (" + table.backquote(field.foreignKey.field) + ")" +
                    " on delete " + field.foreignKey.onDelete +
                    " on update " + field.foreignKey.onUpdate;
                foreigns.push(foreign);
            }
            ;
            columns.push(column);
        }
        let sql = "create table " + table.backquote(table.name) +
            " (\n\t" + columns.join(",\n\t");
        if (primary)
            sql += ",\n\tprimary key(" + table.backquote(primary) + ")";
        if (foreigns.length)
            sql += ",\n\t" + foreigns.join(",\n\t");
        sql += "\n)";
        if (table.config.type === "maria")
            sql += " engine=Aria transactional=1";
        else
            sql += " engine=InnoDB";
        sql += ` default charset=${table.config.charset}`;
        return autoIncrement ? sql + autoIncrement : sql;
    }
    random(query) {
        query["_orderBy"] = "rand()";
        return query;
    }
}
MysqlAdapter.Pools = {};
exports.MysqlAdapter = MysqlAdapter;
//# sourceMappingURL=index.js.map