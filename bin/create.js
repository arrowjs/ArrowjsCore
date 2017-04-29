'use strict';
const globalFunction = require('../libs/global_function');
const fs = require('fs');

module.exports = function (params, options) {
  if (!params) {
    return console.log('\x1b[31mNo feature name\x1b[0m')
  }
  const appPath = process.cwd()
  const dbConfig = require(appPath + '/config/database')
  const listFeatures = fs.readdirSync(appPath + '/features')
  if (listFeatures.indexOf(params.toLowerCase()) > -1) {
    return console.log(`\x1b[31mYou had a feature name "${params}"\x1b[0m`)
  }
  globalFunction.createFeature(params.toLowerCase(), {
    dbType: dbConfig.db.dialect,
  }, appPath)
  console.log(`\x1b[32mCreate "${params}" feature successfully\x1b[0m`)
}
