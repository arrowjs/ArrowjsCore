"use strict";

const Sequelize = require('sequelize'),
    logger = require('./logger'),
    pg = require('pg');
var db;

//TODO : If db.database = mongo call mongoose
exports.connectDB = function connectDB(application) {
    let dbConfig = application._config.db;
    return new Promise(function (resolve, reject) {
        var conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@' + dbConfig.host + ":" + dbConfig.port;
        var client = new pg.Client({
            user: dbConfig.username,
            password: dbConfig.password,
            database: "postgres",
            host: dbConfig.host,
            port: dbConfig.port,
        });
        client.connect(function (err) {
            if (err) {
                return reject(new Error("Could not connect to " + conString))
            }
            client.query('CREATE DATABASE ' + dbConfig.database, function (err) {
                //db should exist now, initialize Sequelize
                db = db || new Sequelize(
                        dbConfig.database,
                        dbConfig.username,
                        dbConfig.password,
                        dbConfig);
                client.end(); // close the connection
                resolve(db)
            });
        });
    })
};

module.exports.db = function () {
    return db
};
