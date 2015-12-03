"use strict";

const Sequelize = require('sequelize'),
     logger = require('./logger');
var db;

//TODO : If db.database = mongo call mongoose
module.exports = function (application) {
    db = db || new Sequelize(
            application._config.db.database,
            application._config.db.username,
            application._config.db.password,
            application._config.db);

    /* istanbul ignore next */
    db.authenticate().catch(function (err) {
        logger.error("Database connect error : Check your database config in file config/env/" + process.env.NODE_ENV + ".js");
        logger.error("Database connect error : " + err.message);
    });
    return db;
};

module.exports.db = function () {
    return db
};
