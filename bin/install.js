'use strict';

const path = require('path');
const fsExtra = require('fs-extra');

module.exports = function (env) {
  const appPath = process.cwd()
  require('child_process').fork(path.resolve(__dirname, '..') + '/node_modules/nodemon/bin/nodemon.js',
    [appPath + '/index.js']);
}
