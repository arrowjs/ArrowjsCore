'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');
const globalFunction = require('../libs/global_function');
module.exports = function (env) {
  exec('pwd', (error, stdout, stderr) => {
    if (error) return console.error(error)
    const appPath = stdout.replace(/\n$/, '')
    const appInfo = require(appPath + '/package.json');
    globalFunction.createArrowStructure(appPath)
    console.log(`Application "${appInfo.name}" created`);
    console.log('Welcome to Arrow world!');
    console.log('Start your app with command')
    console.log('arrow start')
    console.log('Start to develop app with command')
    console.log('arrow dev')
  });
}