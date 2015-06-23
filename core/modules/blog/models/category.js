'use strict';
let slug = require('slug');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("category", {
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        slug: DataTypes.STRING
    }, {
        tableName: 'arr_category',
        timestamps: false,
        hooks: {
            beforeCreate: function (category, op, fn) {
                category.slug = slug(category.name).toLowerCase();
                fn(null, category);
            }
        }
    });
};