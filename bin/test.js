'use strict';

const exec = require('child_process').exec;
const path = require('path');
module.exports = function (env) {
  exec('pwd', (error, stdout, stderr) => {
    if (error) return console.error(error)
    require('child_process').fork(path.resolve(__dirname,'..') + '/node_modules/mocha/bin/mocha');
  });
}

