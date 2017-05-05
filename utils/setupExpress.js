'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Run /config/express.js to configure Express object
 * @param app - ArrowApplication object
 * @param config - this.configManager.getConfig
 * @param setting - parameters in application.start(setting);
 */
module.exports = function setupExpress(app) {
  const config = app.getConfig();
  const setting = app.arrowSettings;

  return new Promise(function (fulfill, reject) {
    let expressFunction;

    if (fs.existsSync(path.resolve(app.arrFolder + "config/express.js"))) {
      expressFunction = require(app.arrFolder + "config/express");
    } else {
      reject(new Error("Cant find express.js in folder config"))
    }
    fulfill(expressFunction(app, config, setting));
  });
};