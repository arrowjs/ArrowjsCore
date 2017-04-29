'use strict';

const path = require('path');
module.exports = function (env) {
  const appPath = process.cwd()
  require('child_process').fork(path.resolve(__dirname, '..') + '/node_modules/mocha/bin/mocha');
}

