"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mysql_1 = require("mysql");
var assign = require("lodash/assign");
var ModelarAdapter;
try {
    ModelarAdapter = require("modelar").Adapter;
}
catch (err) {
    ModelarAdapter = require("../../../").Adapter;
}
var MysqlAdapter = (function (_super) {
    tslib_1.__extends(MysqlAdapter, _super);
    function MysqlAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MysqlAdapter.prototype.connect = function (db) {
        var _this = this;
        var dsn = db.dsn, config = db.config;
        if (MysqlAdapter.Pools[dsn] === undefined) {
            var _config = assign({}, config);
            _config.connectionLimit = config.max;
            MysqlAdapter.Pools[dsn] = mysql_1.createPool(_config);
        }
        return new Promise(function (resolve, reject) {
            MysqlAdapter.Pools[dsn].getConnection(function (err, connection) {
                if (err) {
                    reject(err);
                }
                else {
                    _this.connection = connection;
                    resolve(db);
                }
            });
        });
    };
    MysqlAdapter.prototype.query = function (db, sql, bindings) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = {
                sql: sql,
                values: bindings,
                timeout: db.config.timeout,
            };
            _this.connection.query(options, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    if (res instanceof Array) {
                        var data = [];
                        for (var _i = 0, res_1 = res; _i < res_1.length; _i++) {
                            var row = res_1[_i];
                            data.push(assign({}, row));
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
    };
    MysqlAdapter.prototype.release = function () {
        if (this.connection) {
            this.connection.release();
            this.connection = null;
        }
    };
    MysqlAdapter.prototype.close = function () {
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    };
    MysqlAdapter.close = function () {
        for (var i in MysqlAdapter.Pools) {
            MysqlAdapter.Pools[i].end();
            delete MysqlAdapter.Pools[i];
        }
    };
    MysqlAdapter.prototype.getDDL = function (table) {
        var numbers = ["int", "integer"];
        var columns = [];
        var foreigns = [];
        var primary;
        var autoIncrement;
        for (var key in table.schema) {
            var field = table.schema[key];
            if (field.primary && field.autoIncrement) {
                if (numbers.indexOf(field.type.toLowerCase()) === -1) {
                    field.type = "int";
                    if (!field.length)
                        field.length = 10;
                }
                autoIncrement = " auto_increment=" + field.autoIncrement[0];
            }
            var type = field.type;
            if (field.length instanceof Array) {
                type += "(" + field.length.join(",") + ")";
            }
            else if (field.length) {
                type += "(" + field.length + ")";
            }
            var column = table.backquote(field.name) + " " + type;
            if (field.primary)
                primary = field.name;
            if (field.autoIncrement)
                column += " auto_increment";
            if (field.unique)
                column += " unique";
            if (field.unsigned)
                column += " unsigned";
            if (field.notNull)
                column += " not null";
            if (field.default === null)
                column += " default null";
            else if (field.default !== undefined)
                column += " default " + table.quote(field.default);
            if (field.comment)
                column += " comment " + table.quote(field.comment);
            if (field.foreignKey && field.foreignKey.table) {
                var foreign = "constraint " + table.backquote(field.name)
                    + (" foreign key (" + table.backquote(field.name) + ")")
                    + " references " + table.backquote(field.foreignKey.table)
                    + " (" + table.backquote(field.foreignKey.field) + ")"
                    + " on delete " + field.foreignKey.onDelete
                    + " on update " + field.foreignKey.onUpdate;
                foreigns.push(foreign);
            }
            ;
            columns.push(column);
        }
        var sql = "create table " + table.backquote(table.name) +
            " (\n\t" + columns.join(",\n\t");
        if (primary)
            sql += ",\n\tprimary key (" + table.backquote(primary) + ")";
        if (foreigns.length)
            sql += ",\n\t" + foreigns.join(",\n\t");
        sql += "\n)";
        if (table.config.type === "maria")
            sql += " engine=Aria transactional=1";
        else
            sql += " engine=InnoDB";
        sql += " default charset=" + table.config.charset;
        return autoIncrement ? sql + autoIncrement : sql;
    };
    MysqlAdapter.prototype.random = function (query) {
        query["_orderBy"] = "rand()";
        return query;
    };
    MysqlAdapter.Pools = {};
    return MysqlAdapter;
}(ModelarAdapter));
exports.MysqlAdapter = MysqlAdapter;
//# sourceMappingURL=index.js.map