'use strict';

module.exports = function (sequelize, DataTypes) {
    let Menu = sequelize.define("menus", {
        name: DataTypes.STRING,
        menu_order: DataTypes.STRING,
        created_at: DataTypes.DATE,
        created_by: DataTypes.INTEGER,
        modified_at: DataTypes.DATE,
        modified_by: DataTypes.INTEGER
    }, {
        tableName: 'arr_menu',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "modified_at",
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                Menu.hasMany(models.menu_detail, {foreignKey: 'id'});
                Menu.belongsTo(models.user, {foreignKey: 'created_by'});
                Menu.belongsTo(models.user, {foreignKey: 'modified_by'});
            }
        }
    });
    return Menu;
};
