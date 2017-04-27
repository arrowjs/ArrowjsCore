'use strict';

const exec = require('child_process').exec;
const path = require('path');

module.exports = function (env) {
  exec(path.resolve(__dirname,'..') + '/node_modules/nodemon/bin/nodemon.js index.js',(error, stdout, stderr) => {
    console.log(error)
  })
}