'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');
module.exports = function (env) {
  exec('pwd', (error, stdout, stderr) => {
    const arrowFolder = path.resolve(__dirname,'..')
    fs.copy(arrowFolder + '/appTemplate/install.js', path.join(stdout.replace(/\n$/, ''),'index.js'), err => {
      if (err) return console.error(err)
      exec('node index.js',(error, stdo, stderr) => {
        fs.copy(arrowFolder + '/appTemplate/index.js', path.join(stdout.replace(/\n$/, ''),'index.js'), err => {
          if (err) return console.error(err)
          console.log('Arrow created')
        });
      })
    });
  });
}