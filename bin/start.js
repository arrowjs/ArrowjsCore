'use strict';

const exec = require('child_process').exec;
module.exports = function (env) {
  exec('node index.js',(error, stdout, stderr) => {
    console.log(error)
  })
}