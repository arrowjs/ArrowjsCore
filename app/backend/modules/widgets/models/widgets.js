"use strict";
let crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {
    let Widgets = sequelize.define("widgets", {
        id: DataTypes.BIGINT,
        sidebar: DataTypes.STRING,
        data: DataTypes.STRING,
        created_at: DataTypes.DATE,
        created_by: DataTypes.INTEGER,
        modified_at: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        widget_type: DataTypes.STRING,
        ordering: DataTypes.INTEGER
    }, {
        tableName: 'arr_widgets',
        timestamps: true,
        // I don't want createdAt
        createdAt: "created_at",

        // I want updatedAt to actually be called updateTimestamp
        updatedAt: "modified_at",
        // And deletedAt to be called destroyTime (remember to enable paranoid for this to work)
        deletedAt: false
    });

    return Widgets;
};
