"use strict";

module.exports = function (app) {
    let structureConfig = require(app.arrFolder + "/config/structure");
    try {
        if(typeof structureConfig !== "object" && structureConfig.manager && structureConfig.module && structureConfig.service) {
            throw Error("Your structure config file is invalid");
        }
    } catch(err) {
        structureConfig = require(app.baseFolder + "/config/structure");
    }
    return structureConfig
};