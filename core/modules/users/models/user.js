"use strict";
let crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define("user", {
        user_login: DataTypes.STRING(60),
        user_pass: DataTypes.STRING(64),
        user_email: DataTypes.STRING(100),
        user_url: DataTypes.STRING(100),
        user_registered: DataTypes.DATE,
        user_activation_key: DataTypes.STRING(60),
        user_status: DataTypes.STRING,
        display_name: DataTypes.STRING(250),
        phone: DataTypes.STRING,
        user_image_url: DataTypes.TEXT,
        salt: DataTypes.STRING(255),
        role_id: DataTypes.INTEGER,
        reset_password_expires: DataTypes.BIGINT,
        reset_password_token: DataTypes.STRING
    }, {
        timestamps: false,
        tableName: 'arr_user',

        classMethods: {
            associate: function (models) {
                User.hasOne(models.users_info, {foreignKey: 'user_id'});
                User.hasMany(models.menus, {foreignKey: 'id'});
                User.hasMany(models.menu_detail, {foreignKey: 'id'});
                User.belongsTo(models.role, {foreignKey: 'role_id'});
            }
        },
        instanceMethods: {
            authenticate: function (password) {
                return this.user_pass === this.hashPassword(password);
            },
            hashPassword: function (password) {
                if (this.salt && password) {
                    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
                } else {
                    return password;
                }
            }
        },
        hooks: {
            beforeCreate: function (user, op, fn) {
                user.salt = randomid(50);
                user.user_pass = user.hashPassword(user.user_pass);
                fn(null, user);
            }
        }

    });

    return User;
};

let randomid = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};