"use strict";

let SystemManager = require('./SystemManager');
let __ = require('../libs/global_function');
let Database = require("../libs/database");
let path = require("path");

class ModelManager extends SystemManager {
    constructor(app) {
        super();
        let config = app._config;
        let database = new Database(config.db.database, config.db.username, config.db.password, config.db);

        let db = {};

        /** Import models core */
        __.getGlobbedFiles(__base + 'core/modules/*/models/*.js').forEach(function (routePath) {
            let model = database.import(path.resolve(routePath));
            db[model.name] = model;
        });

        /** Import models user created */
        __.getGlobbedFiles(__base + 'app/modules/*/models/*.js').forEach(function (routePath) {
            let model = database.import(path.resolve(routePath));
            db[model.name] = model;
        });
        Object.keys(db).forEach(function (modelName) {
            if ("associate" in db[modelName]) {
                db[modelName].associate(db)
            }
        });

        database.sync();
        db.sequelize = database;
        db.Sequelize = Database;
        this._databases = db;
    }
};

module.exports = ModelManager;