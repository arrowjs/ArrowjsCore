'use strict';

const exec = require('child_process').exec;
module.exports = function (env) {
  exec('nodemon index.js',(error, stdout, stderr) => {
    console.log(error)
  })
}