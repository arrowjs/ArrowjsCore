#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const init = require('./init');
const dev = require('./dev');
const start = require('./start');

program
  .version('1.0.0')
  .arguments('<cmd> [env]')
  .action(function (cmd, env) {
    cmdValue = cmd;
    envValue = env;
  });

program.parse(process.argv);

function noCommand() {
  console.error('no command given!');
  process.exit(1);
}
switch (cmdValue) {
  case 'init':
    init(envValue)
    break;
  case 'dev':
    dev(envValue);
    break;
  case 'start':
    start(envValue);
    break;
  default:
    noCommand()
}