"use strict";
let __ = require('../libs/global_function');
let events = require('events');
let path = require('path');
let _ = require('lodash');
let Express = require('express');
let Database = require("../libs/database");
let actionByAttribute = require('./handleAttribute/handleFunction');
let ViewEngine = require("../libs/ViewEngine");


class SystemManager extends events.EventEmitter {
    constructor(app, name) {
        super();
        this._config = app._config;
        this.arrFolder = app.arrFolder;
        this.structure = app.structure;
        this.pub = app.redisClient;
        this.sub = app.redisSubscriber();
        this._app = app;
        this.name = name;
        this.viewEngine = null;
        let self = this;
        let updateKey = self._config.redis_event['update_' + self.name] || ('update_' + self.name);
        this.sub.subscribe(self._config.redis_prefix + updateKey);

        this.sub.on("message", function (demo) {
            self.getCache();
        });

    }

    getCache() {
        let self = this;
        return this.pub.getAsync(self._config.redis_prefix + self._config.redis_key[self.name] || self.name)
            .then(function (data) {
                if (data) {
                    let cache = JSON.parse(data);
                    _.assign(self["_" + self.name], cache);
                }
                return (self["_" + self.name]);
            }.bind(this))
            .catch(function (err) {
                log(self.name + " Manager Class: ", err);
                return err
            }.bind(this));
    }

    setCache() {
        let self = this;

        if (self["_" + self.name]) {
            let data = getInfo(self["_" + self.name]);
            return this.pub.setAsync(self._config.redis_prefix + self._config.redis_key[self.name] || self.name, JSON.stringify(data));
        } else {
            return this.pub.setAsync(self._config.redis_prefix + self._config.redis_key[self.name] || self.name, null);
        }
    }

    reload() {
        let self = this;
        return self.getCache().then(function (a) {
            let name = self.name;
            let updateKey = self._config.redis_event['update_' + self.name] || ('update_' + self.name);
            return self.pub.publishAsync(self._config.redis_prefix + updateKey, "update " + name)
        })
    }

    eventHook(events) {
        this._events = events._events
    }

    loadComponents() {
        let self = this;
        let struc = this.structure[self.name];
        let _base = this.arrFolder;
        let privateName = "_" + self.name;
        let components = {};
        let _app = this._app;
        let paths = {};
        if (struc.type === "single") {
            Object.keys(struc.path).map(function (id) {
                struc.path[id].path.map(function (globMaker) {
                    let componentGlobLink = path.normalize(_base + globMaker(self._config));
                    let listComponents = __.getGlobbedFiles(componentGlobLink);
                    let componentFolder = componentGlobLink.slice(0, componentGlobLink.indexOf('*'));
                    listComponents.forEach(function (link) {
                        let nodeList = path.relative(componentGlobLink, link).split(path.sep).filter(function (node) {
                            return (node !== "..")
                        });
                        let componentConfigFunction = require(link);
                        if (typeof componentConfigFunction === "object") {
                            let componentConfig = componentConfigFunction;
                            let componentName = componentConfig.name || nodeList[0];
                            paths[componentName] = paths[componentName] || {};
                            paths[componentName].configFile = link;
                            paths[componentName].path = componentFolder + nodeList[0];
                            paths[componentName].strucID = id;
                            paths[componentName].name = componentName;
                        }
                    });
                });
            })
        }

        Object.keys(paths).map(function (name) {
            let id = paths[name].strucID;
            if (id) {
                components[name] = {};
                components[name].name = paths[name].name;
                components[name]._path = paths[name].path;
                components[name]._configFile = paths[name].configFile;
                components[name]._strucID = id;
                components[name]._structure = struc.path[id] || struc;
                components[name].controllers = {};
                components[name].routes = {};
                components[name].models = {};
                components[name].views = [];
                //components[name].helpers = {};
                let componentConfig = require(paths[name].configFile);
                _.assign(components[name], componentConfig);

                //Logic make order to loading
                if (components[name]._structure.path) {
                    let data = actionByAttribute("path", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.extends) {
                    let data = actionByAttribute("extends", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.model) {
                    let data = actionByAttribute("model", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.helper) {
                    let data = actionByAttribute("helper", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.controller) {
                    let data = actionByAttribute("controller", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.view) {
                    let data = actionByAttribute("view", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.route) {
                    let data = actionByAttribute("route", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                Object.keys(components[name]._structure).map(function (attribute) {
                    if (["controller", "view", "path", "helper", "model", "extends", "route"].indexOf(attribute) === -1) {
                        let data = actionByAttribute(attribute, components[name], paths[name].path, _app);
                        _.assign(components[name], data);
                    }
                });
            }
        });

        //handle Database
        let defaultDatabase = {};
        let defaultQueryResolve = function () {
            return new Promise(function (fulfill, reject) {
                fulfill("No models")
            })
        };
        Object.keys(components).map(function (key) {
            if (Object.keys(components[key].models).length > 0) {
                if (_.isEmpty(defaultDatabase)) {
                    defaultDatabase = Database(_app);
                }
            }
            components[key].models.rawQuery = defaultDatabase.query ? defaultDatabase.query.bind(defaultDatabase) : defaultQueryResolve;
        });

        let featureViewEngine = this.viewEngine;;
        let viewEngineSetting = _.assign(_app._config.nunjuckSettings,{ express: self._app._expressApplication});
        Object.keys(components).map(function (key) {
            if (!_.isEmpty(components[key].views)) {
                featureViewEngine = featureViewEngine || ViewEngine(_base,viewEngineSetting);
            }
            if (_.isArray(components[key].views)) {
                components[key].render = makeRender(featureViewEngine,components[key].views,key)
                components[key].viewEngine = featureViewEngine
            } else {
                Object.keys(components[key].views).map(function (second_key) {
                    components[key][second_key] = components[key][second_key] || {};
                    components[key][second_key].render = makeRender(featureViewEngine,components[key][second_key].views,key);
                    components[key][second_key].viewEngine = featureViewEngine

                })
            }
        });

        this[privateName] = components;

    }


    getPermissions(name) {
        let self = this;
        let privateName = "_" + self.name;
        let result = {};
        if (name) {
            if (self[privateName] && self[privateName][name] && self[privateName][name].permissions) {
                result.name = self[privateName][name].permissions || [];
                return result
            }
        } else {
            Object.keys(self[privateName]).map(function (componentName) {
                result[componentName] = self[privateName][componentName].permissions || [];
            })
        }
        return result
    }
}

function handleView(obj, application, componentName) {
    let miniPath = obj.func(application._config, componentName);
    let normalizePath;
    if (miniPath[0] === "/") {
        normalizePath = path.normalize(obj.base + "/" + miniPath);
    } else {
        normalizePath = path.normalize(obj.fatherBase + "/" + miniPath)
    }
    return normalizePath
}

/**
 *
 * @param viewEngine : manager view engine
 * @param componentView : view folder
 * @param componentName :
 * @returns {Function}
 */

function makeRender(viewEngine,componentView, componentName) {
    let application = viewEngine.express._arrApplication;
    return function (view, options, callback) {

        var done = callback;
        var opts = options || {};


        // support callback function as second arg
        if (typeof options === 'function') {
            done = options;
            opts = {};
        }

        if (application._config.viewExtension && view.indexOf(application._config.viewExtension) === -1) {
            view += "." + application._config.viewExtension;
        }

        viewEngine.loaders[0].pathsToNames = {};
        viewEngine.loaders[0].cache = {};
        viewEngine.loaders[0].searchPaths = componentView.map(function (obj) {
            return handleView(obj, application, componentName);
        });

        viewEngine.render(view, opts, done);
    };
}

/**
 *
 * @param obj
 * @param application
 * @returns {*}
 */

function getInfo(obj) {
    return JSON.parse(JSON.stringify(obj), function (key, value) {
        if (_.isEmpty(value) && !_.isNumber(value) && !_.isBoolean(value)) {
            return
        } else {
            return value
        }
    });
}

module.exports = SystemManager;