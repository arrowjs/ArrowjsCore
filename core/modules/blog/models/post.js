"use strict";

module.exports = function (sequelize, DataTypes) {
    let Posts = sequelize.define("post", {
        title: {
            type: DataTypes.STRING,
            validate: {
                max: 255
            }
        },
        alias: DataTypes.STRING(255),
        intro_text: DataTypes.TEXT,
        full_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: DataTypes.STRING(255),
        published: DataTypes.INTEGER,
        published_at: DataTypes.DATE,
        categories: DataTypes.TEXT,
        type: DataTypes.STRING(15),
        created_at: DataTypes.DATE,
        created_by: DataTypes.INTEGER,
        modified_at: DataTypes.DATE,
        modified_by: DataTypes.INTEGER,
        author_visible: DataTypes.BOOLEAN
    },{
        tableName: 'arr_post',
        createdAt: 'created_at',
        updatedAt: 'modified_at',
        classMethods: {
            associate: function (models) {
                Posts.belongsTo(models.user, {foreignKey: 'created_by'});
            }
        }
    });
    return Posts;
};