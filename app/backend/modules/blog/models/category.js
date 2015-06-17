'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("category", {
        count: DataTypes.INTEGER,
        name: DataTypes.STRING,
        slug: DataTypes.STRING
    }, {
        tableName: 'arr_category'
    });
};