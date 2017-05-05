"use strict";
const path = require('path');
const fs = require('fs');

module.exports = function importConfigFromFile(filename) {
  let app = this;
  let configFile = path.normalize(app.arrFolder + "/" + filename);
  fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) throw err;
    try {
      let obj = JSON.parse(data);
      app.updateConfig(obj);
    } catch (err) {
      throw  err
    }
  });
  fs.watch(configFile, function (event) {
    if (event === "change") {
      fs.readFile(configFile, 'utf8', function (err, data) {
        if (err) throw err;
        try {
          let obj = JSON.parse(data);
          app.updateConfig(obj);
        } catch (err) {
          throw  err
        }
      });
    }
  })
};