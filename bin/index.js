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

program
  .version('1.0.0')

program
  .command('init [options]')
  .description('Init an arrowjs application')
  .option("-api, --api_mode", "Init an api application")
  .action(function(env, options){
    const mode = options.api_mode;
    init({api: mode})
  });

program
  .command('start')
  .description('Start an arrowjs application')
  .option("-p, --port", "Setup app port")
  .option("-env, --environment", "Setup app environment")
  .action(function(en, options){
    const env = options.environment || 'production';
    const port = options.port;
    start({env, port})
  });

program
  .command('dev')
  .description('Run application in development mode')
  .option("-p, --port", "Setup app port")
  .option("-env, --environment", "Setup app environment")
  .action(function(en, options){
    // const env = options.environment || 'development';
    // const port = options.port;
    dev({})
  });
program
  .command('test [params]')
  .description('Run application unit test')
  .action(function(params, options){
    test()
  });
program
  .command('create [params]')
  .description('Create new feature')
  .option("-t, --template", "Setup app port")
  .action(function(params, options){
    create(params, {template: options.template})
  });


program.parse(process.argv);
