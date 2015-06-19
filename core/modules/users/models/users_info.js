"use strict";

module.exports = function (sequelize, DataTypes) {
    let UserInfo = sequelize.define("users_info", {
        user_biology: DataTypes.STRING(1000),
        user_blog_url: DataTypes.STRING(100),
        user_id: DataTypes.BIGINT
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        tableName: 'users_info',
        classMethods: {
            associate: function (models) {
                UserInfo.belongsTo(models.user, {foreignKey : 'user_id'});
            }
        }
    });

    return UserInfo;
};