'use strict';

const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const globalFunction = require('../libs/global_function');
module.exports = function (params, options) {
  exec('pwd', (error, stdout, stderr) => {
    if (!params) {
      return console.log('No feature name')
    }

    const appPath = path.join(stdout.replace(/\n$/, ''))
    const dbConfig = require(appPath + '/config/database')
    const listFeatures = fs.readdirSync(appPath + '/features')
    if (listFeatures.indexOf(params.toLowerCase()) > -1) {
      return console.log(`You had a feature name "${params}"`)
    }
    globalFunction.createFeature(params.toLowerCase(),{
      dbType: dbConfig.db.dialect,
    }, appPath)
  });
}
