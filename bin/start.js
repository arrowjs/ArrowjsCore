'use strict';
module.exports = function (options) {
  const appPath = process.cwd();
  let commands = [];
  let env = {env : {}};
  options.inspect && commands.push('--inspect');
  options.debug && commands.push('--debug-brk');
  options.port && (env.env.PORT = options.port);
  options.env && (env.env.NODE_ENV = options.env);
  require('child_process').fork(appPath + '/index.js', commands, env)
}
