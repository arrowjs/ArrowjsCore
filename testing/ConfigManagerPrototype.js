"use strict";

let SystemManager = require('./SystemManagerPrototype');
let __ = require('../libs/global_function');
let _ = require('lodash');
let util = require('util');


function ConfigManager(app,name) {
    SystemManager.call(this,app,name);
};

util.inherits(ConfigManager,SystemManager);

//ConfigManager.prototype.getConfig = function getConfig(key) {
//    return this._config[key];
//};
//
//ConfigManager.prototype.setConfig = function setConfig(key,setting){
//    this._config[key] = setting;
//    let self = this;
//    return self.setCache().then(self.reload());
//};
//
//ConfigManager.prototype.getCache = function getCache() {
//    let self = this._config;
//    return this.pub.getAsync(self.redis_prefix + self.redis_key.configs)
//        .then(function (data) {
//            if(data) {
//                let conf = JSON.parse(data);
//                _.assign(this._config,conf);
//            }
//            return(this._config);
//        }.bind(this))
//        .catch(function (err) {
//            log("Config Manager Class: ",err);
//            return err
//        }.bind(this));
//};
//
//ConfigManager.prototype.reload =  function reload(){
//    let self = this;
//    return self.getCache().then(function () {
//        return self.pub.publishAsync(self._config.redis_prefix + self._config.redis_event.update_config,"Update config")
//    })
//};
//
//ConfigManager.prototype.setCache = function setCache() {
//    let self = this._config;
//    return this.pub.setAsync(self.redis_prefix + self.redis_key.configs, JSON.stringify(self))
//};

module.exports = ConfigManager;