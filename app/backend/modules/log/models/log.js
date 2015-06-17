'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("logs", {
        event_name: DataTypes.STRING,
        message: DataTypes.STRING,
        module_name: DataTypes.STRING,
        note: DataTypes.STRING,
        type: DataTypes.INTEGER
    }, {
        tableName: 'arr_log',
        createdAt: 'created_at',
        updatedAt: false
    });
};
