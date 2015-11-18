"use strict";

let Sequelize = require('sequelize');
let logger = require('./logger');
let sequelize;

//TODO : If db.database = mongo call mongoose
module.exports = function (application) {
    sequelize = sequelize || new Sequelize(application._config.db.database, application._config.db.username, application._config.db.password, application._config.db)

    sequelize.query('select').catch(function (err) {
        logger.error("Database connect error : Check your database config in file config/" + process.env.NODE_ENV + ".js");
        logger.error("Database connect error : " + err.message);
        process.exit();
    });
    return sequelize;
};

