"use strict";
let __ = require('../libs/global_function');
let events = require('events');
let path = require('path');
let _ = require('lodash');
let Express = require('express');
let Database = require("../libs/database");
let actionByAttribute = require('./handleAttribute/handleFunction');

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
                Object.keys(components[name]._structure).map(function (attribute) {
                    let data = actionByAttribute(attribute, components[name], paths[name].path, _app);
                    _.assign(components[name], data);
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

        Object.keys(components).map(function (key) {
            if (_.isArray(components[key].views)) {
                components[key].render = function (name, ctx, cb) {
                    if (_app._config.viewExtension && name.indexOf(_app._config.viewExtension) === -1) {
                        name += "." + _app._config.viewExtension;
                    }
                    return new Promise(function (fulfill, reject) {
                        _app.viewTemplateEngine.loaders[0].pathsToNames = {};
                        _app.viewTemplateEngine.loaders[0].cache = {};
                        _app.viewTemplateEngine.loaders[0].searchPaths = components[key].views.map(function (obj) {
                            return handleView(obj, _app);
                        });
                        _app.viewTemplateEngine.render.call(_app.viewTemplateEngine, name, ctx, function (err, html) {
                            if (err) {
                                reject(err);
                            }
                            fulfill(html);
                        });
                    })
                };
            } else {
                Object.keys(components[key].views).map(function (second_key) {
                    components[key][second_key] = components[key][second_key] || {};
                    components[key][second_key].render = function (name, ctx, cb) {
                        if (_app._config.viewExtension && name.indexOf(_app._config.viewExtension) === -1) {
                            name += "." + _app._config.viewExtension;
                        }
                        return new Promise(function (fulfill, reject) {
                            _app.viewTemplateEngine.loaders[0].pathsToNames = {};
                            _app.viewTemplateEngine.loaders[0].cache = {};
                            _app.viewTemplateEngine.loaders[0].searchPaths = components[key][second_key].views.map(function (obj) {
                                return handleView(obj, _app);
                            });
                            _app.viewTemplateEngine.render.call(_app.viewTemplateEngine, name, ctx, function (err, html) {
                                if (err) {
                                    reject(err);
                                }
                                fulfill(html);
                            });
                        })
                    };
                })
            }

        });
        this[privateName] = components;

    }
}
/**
 *
 * @param obj
 * @param application
 * @returns {*}
 */
function handleView(obj, application) {
    let miniPath = obj.func(application._config);
    let normalizePath;
    if (miniPath[0] === "/") {
        normalizePath = path.normalize(obj.base + "/" + miniPath);
    } else {
        normalizePath = path.normalize(obj.fatherBase + "/" + miniPath)
    }
    return normalizePath
}


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