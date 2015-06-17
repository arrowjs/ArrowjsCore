'use strict'
/**
 * Created by thanhnv on 1/19/15.
 */
module.exports = function (sequelize, DataTypes) {
    let MenuDetail = sequelize.define("menu_detail", {
        menu_id:DataTypes.INTEGER,
        name: DataTypes.STRING,
        attribute: DataTypes.STRING,
        link: DataTypes.STRING,
        parent_id: DataTypes.INTEGER,
        status: DataTypes.STRING,
        created_at: DataTypes.DATE,
        created_by: DataTypes.INTEGER,
        modified_at: DataTypes.DATE,
        modified_by: DataTypes.INTEGER

    }, {
        tableName: 'arr_menu_detail',
        timestamps: true,
        // I don't want createdAt
        createdAt: "created_at",

        // I want updatedAt to actually be called updateTimestamp
        updatedAt: "modified_at",
        // And deletedAt to be called destroyTime (remember to enable paranoid for this to work)
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                MenuDetail.belongsTo(models.menus, {foreignKey: 'menu_id'});
                MenuDetail.belongsTo(models.user,{foreignKey:'created_by'});
                MenuDetail.belongsTo(models.user,{foreignKey:'modified_by'});
            }
        }
    });
    return MenuDetail;
}
