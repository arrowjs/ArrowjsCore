"use strict";

let SystemManager = require("./../manager/SystemManager");
let  __ = require("../libs/global_function");
let  _  = require("lodash");
let path = require("path");
let Database = require('../libs/database');

class ServiceManager extends SystemManager {
    constructor(app) {
        super(app);
        let self = this;
        let services = {};
        let listServices = __.getGlobbedFiles(__base + "/services/**/service.js");
        listServices.map(function (servicePath) {
            //Loading services information
            let serviceInfo = require(servicePath);
            if(serviceInfo) {
                let arrayPath = servicePath.split("/");
                serviceInfo.name = serviceInfo.name || arrayPath[arrayPath.length - 2];
                services[serviceInfo.name] = serviceInfo;

                let serviceFolder = arrayPath.slice(0,arrayPath.length - 1).join("/");
                services[serviceInfo.name].path =  serviceFolder;

                // Get config
                let serviceConfig = Object.create(null);
                _.assign(serviceConfig,self._config,serviceInfo.config);

                //loading models
                let database =  new Database(serviceConfig.db.database, serviceConfig.db.username, serviceConfig.db.password, serviceConfig.db);

                services[serviceInfo.name].models = {};
                __.getGlobbedFiles(serviceFolder + '/models/*.js').forEach(function (modelPath) {
                    let model = database.import(path.resolve(modelPath));
                    services[serviceInfo.name].models[model.name] = model;
                });

                Object.keys(services[serviceInfo.name].models).forEach(function (modelName) {
                    if ("associate" in services[serviceInfo.name].models[modelName]) {
                        services[serviceInfo.name].models[modelName].associate(services[serviceInfo.name].models)
                    }
                });

                //loading functions
                let controllers = require(serviceFolder + "/controller.js");
                Object.keys(controllers).map(function (key) {
                    controllers[key] =  controllers[key].bind(services[serviceInfo.name]);
                });
                _.assign(services[serviceInfo.name], controllers);

            }

        })
        this._services = services;
    };

}


module.exports = ServiceManager;