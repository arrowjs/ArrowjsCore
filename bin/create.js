'use strict';

const exec = require('child_process').exec;
const path = require('path');
module.exports = function (env) {
  exec('pwd', (error, stdout, stderr) => {
    console.log('nothing to create')
  });
}
