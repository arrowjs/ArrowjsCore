'use strict';

const globalFunction = require('../libs/global_function');

module.exports = function (env) {
  const appPath = process.cwd()
  const appInfo = require(appPath + '/package.json');
  globalFunction.createArrowStructure(appPath, env)
  console.log(`\x1b[32mApplication "${appInfo.name}" created\x1b[0m`);
  console.log('\x1b[32mWelcome to Arrow world!\x1b[0m');
  console.log('\x1b[32mStart your app with command\x1b[0m')
  console.log('arrow start')
  console.log('\x1b[32mStart to develop app with command\x1b[0m')
  console.log('arrow dev')
}