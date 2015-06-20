'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("category", {
        id : {
            type: DataTypes.INTEGER,
            autoIncrement :  true
        },
        count: DataTypes.INTEGER,
        name: DataTypes.STRING,
        slug: DataTypes.STRING
    }, {
        tableName: 'arr_category',
        createdAt: false,
        updatedAt: false
    });
};