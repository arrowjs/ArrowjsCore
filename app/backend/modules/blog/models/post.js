"use strict";

module.exports = function (sequelize, DataTypes) {
    let Posts = sequelize.define("posts", {
        title: DataTypes.STRING(255),
        alias: DataTypes.STRING(255),
        intro_text: DataTypes.TEXT,
        full_text: DataTypes.TEXT,
        image: DataTypes.STRING(255),
        tags: DataTypes.TEXT,
        hit: DataTypes.BIGINT,
        published: DataTypes.INTEGER,
        published_at: DataTypes.DATE,
        cache: DataTypes.TEXT,
        categories: DataTypes.TEXT,
        type: DataTypes.STRING(15),
        seo_info: DataTypes.JSONB,
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