"use strict";

let SystemManager = require('./SystemManager');
let __ = require('./../libs/global_function');
let Sequelize = require("sequelize");
let path = require("path");

class ModelManager extends SystemManager {
    constructor(app) {
        super();
        let config = app._config;
        let sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);

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
        this._databases = db;
    }
};

module.exports = ModelManager;