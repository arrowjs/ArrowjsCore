'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');
const globalFunction = require('../libs/global_function');
module.exports = function (env) {
  exec('pwd', (error, stdout, stderr) => {
    if (error) return console.error(error)
    globalFunction.createArrowStructure(path.join(stdout.replace(/\n$/, '')))
  });
}