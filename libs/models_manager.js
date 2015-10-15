"use strict";

let path = require("path");
let Sequelize = require("sequelize");
let sequelize;

var __ = require('./global_function');

module.exports = function () {
    if (__config.db) {
        sequelize = new Sequelize(__config.db.database, __config.db.username, __config.db.password, __config.db);
    }

    let db = {};

    /** Import models core */
    __.getGlobbedFiles(__base + 'core/modules/*/models/*.js').forEach(function (routePath) {
        let model = sequelize["import"](path.resolve(routePath));
        db[model.name] = model;
    });

    /** Import models user created */
    __.getGlobbedFiles(__base + 'app/modules/*/models/*.js').forEach(function (routePath) {
        let model = sequelize["import"](path.resolve(routePath));
        db[model.name] = model;
    });
    Object.keys(db).forEach(function (modelName) {
        if ("associate" in db[modelName]) {
            db[modelName].associate(db)
        }
    });

    sequelize.sync();
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    return db
};

