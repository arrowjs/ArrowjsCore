"use strict";

module.exports = function (sequelize, DataTypes) {
    let Role = sequelize.define("role", {
        name: DataTypes.STRING,
        rules: DataTypes.STRING,
        f_rules: DataTypes.STRING,
        created_at: DataTypes.DATE,
        created_by: DataTypes.INTEGER,
        modified_at: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        status: DataTypes.INTEGER

    }, {
        tableName: 'arr_role',
        createdAt: 'created_at',
        updatedAt: 'modified_at',
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                Role.hasMany(models.user, {foreignKey: 'role_id'});
            }
        }
    });
    return Role;
};