'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("category", {
        description: DataTypes.STRING,
        parent: DataTypes.INTEGER,
        count: DataTypes.INTEGER,
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
        category_group: DataTypes.INTEGER
    }, {
        tableName: 'arr_category'
    });
};
