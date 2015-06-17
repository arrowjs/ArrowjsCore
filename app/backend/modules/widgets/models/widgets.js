"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("widgets", {
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
        tableName: 'arr_widget',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "modified_at",
        deletedAt: false
    });
};
