"use strict";

module.exports = function(sequelize, DataTypes) {
    var Usermeta = sequelize.define("usermeta", {
        id: DataTypes.BIGINT,
        user_id: DataTypes.BIGINT,
        meta_key: DataTypes.STRING,
        meta_value: DataTypes.TEXT
    },{
        classMethods: {
            associate: function(models) {
                Usermeta.belongsTo(models.user, {as: 'user', foreignKey: 'user_id'});
            }
        },
        timestamps: false,
        tableName: 'usermeta'
    });

    return Usermeta;
};