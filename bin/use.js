'use strict';
const globalFunction = require('../libs/global_function');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = function (params, options) {
  if (!params) {
    return console.log('\x1b[31mNo feature name\x1b[0m')
  }
  const appPath = process.cwd()
  const arrowFolder = path.resolve(__dirname,'..')
  const dbConfig = require(appPath + '/config/database')
  const listFeatures = fs.readdirSync(appPath + '/features')
  const listArrowFeatures = fs.readdirSync(arrowFolder + '/packs')
  if (listFeatures.indexOf(params.toLowerCase()) > -1) {
    return console.log(`\x1b[31mYou had a feature name "${params}"\x1b[0m`)
  }
  if (listArrowFeatures.indexOf(params.toLowerCase()) === -1) {
    return console.log(`\x1b[31mWe dont' had a feature name "${params}"\x1b[0m`)
  }
  if (options.force) {
    globalFunction.useFeature(params.toLowerCase(), {
      dbType: dbConfig.db.dialect,
    }, appPath)
    return console.log(`\x1b[32mInstall "${params}" feature successfully\x1b[0m`)
  }

  switch (params.toLowerCase()) {
    case 'user':
      break;
    case 'role':
      if (listFeatures.indexOf('user') > -1) {
        console.log(`\x1b[31mYou had a feature name "user". Maybe conflict with default "user" feature\x1b[0m`)
        return console.log(`\x1b[31mDelete your current "user" and retry this command\x1b[0m`)
      }
      break;
    case 'blog':
      if (listFeatures.indexOf('user') > -1) {
        console.log(`\x1b[31mYou had a feature name "user". Maybe conflict with default "user" feature\x1b[0m`)
        return console.log(`\x1b[31mDelete your current "user" and retry this command\x1b[0m`)
      }
      if (listFeatures.indexOf('role') > -1) {
        console.log(`\x1b[31mYou had a feature name "role". Maybe conflict with default "role" feature\x1b[0m`)
        return console.log(`\x1b[31mDelete your current "role" and retry this command\x1b[0m`)
      }
  }
  globalFunction.useFeature(params.toLowerCase(), {
    dbType: dbConfig.db.dialect,
  }, appPath)
  console.log(`\x1b[32mInstall "${params}" feature successfully\x1b[0m`)
}
