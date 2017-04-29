'use strict';

const path = require('path');
module.exports = function (options) {
  const appPath = process.cwd();
  let commands = [];
  let env = {env : {}};
  options.inspect && commands.push('--inspect');
  options.debug && commands.push('--debug-brk');
  options.port && (env.env.PORT = options.port);
  options.env && (env.env.NODE_ENV = options.env);
  commands.push(appPath + '/index.js');
  require('child_process').fork(path.resolve(__dirname, '..') + '/node_modules/nodemon/bin/nodemon.js',
    commands, env);
}

