'use strict';

const EventEmitter = require('events').EventEmitter;
const addConfig = require('./addConfig');
const addConfigFile = require('./addConfigFile');
const ConfigManager = require("../manager/ConfigManager"),
  DefaultManager = require("../manager/DefaultManager");

module.exports = function setupManager(arrowApp) {
  //Share eventEmitter among all kinds of Managers. This helps Manager object notifies each other
  //when configuration is changed
  const eventEmitter = new EventEmitter();

  arrowApp.configManager = new ConfigManager(arrowApp, "config");
  //subscribes to get notification from shared eventEmitter object
  arrowApp.configManager.eventHook(eventEmitter);

  //Create shortcut call
  arrowApp.addConfig = addConfig.bind(arrowApp);
  arrowApp.addConfigFile = addConfigFile.bind(arrowApp);
  arrowApp.getConfig = arrowApp.configManager.getConfig.bind(arrowApp.configManager);
  arrowApp.setConfig = arrowApp.configManager.setConfig.bind(arrowApp.configManager);
  arrowApp.updateConfig = arrowApp.configManager.updateConfig.bind(arrowApp.configManager);

  //_componentList contains name property of composite features, singleton features, widgets, plugins
  arrowApp._componentList = [];
  Object.keys(arrowApp.structure).map(function (managerKey) {
    let key = managerKey;
    let managerName = managerKey + "Manager";
    arrowApp[managerName] = new DefaultManager(arrowApp, key);
    arrowApp[managerName].eventHook(eventEmitter);
    //load sub components of
    arrowApp[managerName].loadComponents(key);
    arrowApp[key] = arrowApp[managerName]["_" + key];
    arrowApp._componentList.push(key);
  }.bind(arrowApp));
};