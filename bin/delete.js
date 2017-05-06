'use strict';

const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');

module.exports = function (params) {
  if (!params) {
    return console.log('\x1b[31mNo feature name\x1b[0m')
  }
  const appPath = process.cwd()
  const listFeatures = fs.readdirSync(appPath + '/features')
  if (!listFeatures.includes(params.toLowerCase())) {
    return console.log(`\x1b[31mYou didn't have a feature name "${params}"\x1b[0m`)
  } else {
    const name = listFeatures[listFeatures.indexOf(params.toLowerCase())]
    fsExtra.removeSync(appPath + '/features/' + name )
    console.log(`\x1b[32mDelete "${name}" feature successfully\x1b[0m`)
  }
}
