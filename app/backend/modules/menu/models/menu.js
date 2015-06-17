'use strict'
/**
 * Created by thanhnv on 1/19/15.
 */
module.exports = function (sequelize, DataTypes) {
    let Menu = sequelize.define("menus", {
        name: DataTypes.STRING,
        status: DataTypes.STRING,
        menu_order: DataTypes.STRING,
        created_at: DataTypes.DATE,
        created_by: DataTypes.INTEGER,
        modified_at: DataTypes.DATE,
        modified_by: DataTypes.INTEGER
    }, {
        tableName: 'arr_menu',
        timestamps: true,
        // I don't want createdAt
        createdAt: "created_at",

        // I want updatedAt to actually be called updateTimestamp
        updatedAt: "modified_at",
        // And deletedAt to be called destroyTime (remember to enable paranoid for this to work)
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                Menu.hasMany(models.menu_detail, {foreignKey: 'id'});
                Menu.belongsTo(models.user,{foreignKey:'created_by'});
                Menu.belongsTo(models.user,{foreignKey:'modified_by'});
            }
        }
    });
    return Menu;
}
