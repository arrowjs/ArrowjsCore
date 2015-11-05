"use strict";

let Sequelize = require('sequelize');

//TODO : Need wrap database here;
module.exports = function (application) {
    let sequelize = new Sequelize(application._config.db.database, application._config.db.username, application._config.db.password, application._config.db)

    sequelize.on('error', function (err) {
        console.log(err);
        return new Database()
    })
    return sequelize;
}

class Database {
    import() {

    }
    associate(){

    }
}