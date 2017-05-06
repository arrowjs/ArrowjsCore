#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const init = require('./init');
const dev = require('./dev');
const start = require('./start');
const test = require('./test');
const create = require('./create');
const del = require('./delete');
const pack = require('./pack');
const use = require('./use');
const clear = require('./clear');
const install = require('./install');

program
  .version('1.0.0')

program
  .command('init')
  .description('Init an arrowjs application')
  .option("-a, --api_mode", "Init an api application")
  .option("-db, --database_type", "Give to specify a database type", 'mongodb')
  .option("-n, --name", "select your app name", 'Arrow')
  .action(function(options){
    init({
      api: options.api_mode,
      db: options.database_type,
      name: options.name
    })
  });

program
  .command('start')
  .description('Start an arrowjs application')
  .option("-p, --port <number>", "Give to specify a port number", parseInt)
  .option("-e, --environment <name>", "Give to specify an environment", 'production')
  .option("-d, --debug-brk", "Enable paused on the first line")
  .option("-i, --inspect", "Enable node inspector")
  .action(function(options){
    start({
      port: options.port,
      env: options.environment,
      debug: options.debugBrk,
      inspect: options.inspect
    })
  });

program
  .command('dev')
  .description('Run application in development mode')
  .option("-p, --port <number>", "Give to specify a port number", parseInt)
  .option("-e, --environment <name>", "Give to specify an environment", 'development')
  .option("-d, --debug-brk", "Enable paused on the first line")
  .option("-i, --inspect", "Enable node inspector")
  .action(function(options){
    dev({
      port: options.port,
      env: options.environment,
      debug: options.debugBrk,
      inspect: options.inspect
    })
  });
program
  .command('test [options]')
  .description('Run application unit test')
  .action(function(params, options){
    test()
  });
program
  .command('create <name>')
  .description('Create new feature')
  .option("-f, --full", "Generate full template files")
  .option("-a, --api", "Use api template")
  .action(function(params, options){
    create(params, {
      full: options.full,
      api: options.api
    })
  });

program
  .command('use <name>')
  .description('Install a default arrowjs feature')
  .option("-f, --force", "Force install arrow feature")
  .action(function(params, options){
    use(params, {force: options.force})
  });

program
  .command('delete <name>')
  .description('Delete a feature')
  .action(function(params, options){
    del(params)
  });

// program
//   .command('pack <name>')
//   .description('Create a feature')
//   .option("-t, --template", "Setup app port")
//   .action(function(params, options){
//     del()
//   });
//
// program
//   .command('install')
//   .description('Install a feature from git, npm, zip')
//   .action(function(params, options){
//     install()
//   });
//
// program
//   .command('clear')
//   .description('Clear redis')
//   .action(function(params, options){
//     clear()
//   });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
