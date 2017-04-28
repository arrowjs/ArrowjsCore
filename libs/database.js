"use strict";

const Sequelize = require('sequelize'),
    mongoose =  require('mongoose'),
    logger = require('./logger'),
    pg = require('pg');
let db;

function postgresConnection(dbConfig) {
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
                db.__arrowDB = dbConfig;
                resolve(db)
            });
        });
    })
}

function mongoConnection(dbConfig) {
    return new Promise(function (resolve, reject) {
        var conString = 'mongodb://' + dbConfig.username + ':' + dbConfig.password + '@' + dbConfig.host + ":" + dbConfig.port + '/' + dbConfig.database;
        mongoose.connect(conString);
        mongoose.Promise = Promise;
        db = mongoose;
        db.__arrowDB = dbConfig;
        mongoose.connection.on('error', function (err) {
            console.log(err.message)
            process.exit(1)
        });
        resolve(db)
    })
}

function defaultConnection(dbConfig) {
    return new Promise(function (resolve, reject) {
        db = db || new Sequelize(
            dbConfig.database,
            dbConfig.username,
            dbConfig.password,
            dbConfig);
        db.__arrowDB = dbConfig;
        resolve(db)
    })
}

exports.connectDB = function connectDB(application) {
    let dbConfig = application._config.db;
    switch (dbConfig.dialect) {
        case 'postgres':
            return postgresConnection(dbConfig);
        case 'mongodb':
            return mongoConnection(dbConfig);
        default:
            return defaultConnection(dbConfig)
    }
};

module.exports.db = function () {
    return db
};
