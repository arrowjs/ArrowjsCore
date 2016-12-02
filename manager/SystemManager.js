"use strict";
const __ = require('../libs/global_function'),
    events = require('events'),
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    Database = require("../libs/database"),
    actionByAttribute = require('./handleAttribute/handleFunction'),
    ViewEngine = require("../libs/ViewEngine");

/**
 * Class is base class for FeatureManager, ThemeManager...
 */
class SystemManager extends events.EventEmitter {
    constructor(app, name) {
        super();
        this.pub = app.redisClient;
        this.sub = app.redisSubscriber();
        this._app = app;
        //this._config = app._config;
        this.name = name;
        this.viewEngine = null;
        let self = this;
        let updateKey = app._config.redis_event['update_' + self.name] || ('update_' + self.name);
        this.sub.subscribe(app._config.redis_prefix + updateKey);

        this.sub.on("message", function (demo) {
            self.getCache();
        });
    }

    /**
     * Get all feature config from cache (Redis)
     * @returns {Promise.<T>}
     */
    getCache() {
        let self = this;
        /* istanbul ignore next */
        return this.pub.getAsync(self._app._config.redis_prefix + self._app._config.redis_key[self.name] || self.name)
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

    /**
     * Set all feature config to cache
     */
    setCache() {
        let self = this;
        /* istanbul ignore next */
        if (self["_" + self.name]) {
            let data = getInfo(self["_" + self.name]);
            return this.pub.setAsync(self._app._config.redis_prefix + self._app._config.redis_key[self.name] || self.name, JSON.stringify(data));
        } else {
            return this.pub.setAsync(self._app._config.redis_prefix + self._app._config.redis_key[self.name] || self.name, null);
        }
    }

    /**
     * Get data from cache and sync cluster
     */
    reload() {
        let self = this;
        return self.getCache().then(function (a) {
            let name = self.name;
            let updateKey = self._app._config.redis_event['update_' + self.name] || ('update_' + self.name);
            return self.pub.publishAsync(self._app._config.redis_prefix + updateKey, "update " + name)
        })
    }

    /**
     * ArrowApplication use singleton events
     * @param events
     */
    eventHook(events) {
        this._events = events._events
    }

    /**
     * Load views, controllers and models of a feature
     */
    loadComponents() {
        let self = this;
        //See /config/structure.js and /lib/buildStructure.js
        let struc = self._app.structure[self.name];
        let _base = self._app.arrFolder;
        let privateName = "_" + self.name;
        let components = {};
        let _app = this._app;
        let paths = {};
        if (struc.type === "single") {
            Object.keys(struc.path).map(function (id) {
                struc.path[id].path.map(function (globMaker) {
                    let componentGlobLink = path.normalize(_base + globMaker(self._app._config));
                    let listComponents = __.getGlobbedFiles(componentGlobLink);
                    let componentFolder;
                    if (componentGlobLink.indexOf('*') > -1) {
                        componentFolder = componentGlobLink.slice(0, componentGlobLink.indexOf('*'));
                    } else {
                        componentFolder = path.dirname(componentGlobLink)
                    }

                    listComponents.forEach(function (link) {
                        let nodeList = path.relative(componentGlobLink, link).split(path.sep).filter(function (node) {
                            return (node !== "..")
                        });
                        let componentConfigFunction = require(link);
                        if (typeof componentConfigFunction === "object") {
                            let componentName = componentConfigFunction.name || nodeList[0] || self.name;
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
                components[name].controllers = Object.create(null);
                components[name].routes = Object.create(null);
                components[name].models = Object.create(null);
                components[name].views = [];
                components[name].actions = Object.create(null);
                let componentConfig = require(paths[name].configFile);
                _.assign(components[name], componentConfig);

                //Logic make order to loading
                if (components[name]._structure.path) {
                    let data = actionByAttribute("path", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.extend) {
                    let data = actionByAttribute("extend", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.model) {
                    let data = actionByAttribute("model", components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                }

                if (components[name]._structure.action) {
                    let data = actionByAttribute("action", components[name], paths[name].path, _app);
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
                    if (["controller", "view", "path", "action", "model", "extends", "route"].indexOf(attribute) === -1) {
                        let data = actionByAttribute(attribute, components[name], paths[name].path, _app);
                        _.assign(components[name], data);
                    }
                });
            }
        });
        // //handle Database
        // let defaultDatabase = {};
        // /* istanbul ignore next */
        // let defaultQueryResolve = function () {
        //     return new Promise(function (fulfill, reject) {
        //         fulfill("No models")
        //     })
        // };
        // Object.keys(components).map(function (key) {
        //     /* istanbul ignore else */
        //     if (Object.keys(components[key].models).length > 0) {
        //         /* istanbul ignore else */
        //         if (_.isEmpty(defaultDatabase)) {
        //             defaultDatabase = Database(_app);
        //         }
        //     }
        //     components[key].models.rawQuery = defaultDatabase.query ? defaultDatabase.query.bind(defaultDatabase) : defaultQueryResolve;
        // });

        let featureViewEngine = this.viewEngine;
        let viewEngineSetting = _.assign(_app._config.nunjuckSettings || {}, {express: _app._expressApplication});
        Object.keys(components).map(function (key) {
            if (!_.isEmpty(components[key].views)) {
                featureViewEngine = featureViewEngine || ViewEngine(_base, viewEngineSetting, _app);
            }
            if (_.isArray(components[key].views)) {
                components[key].render = Promise.promisify(makeRender(featureViewEngine, components[key].views, key, _app));
                components[key].viewEngine = featureViewEngine
            } else {
                Object.keys(components[key].views).map(function (second_key) {
                    components[key][second_key] = components[key][second_key] || {};
                    components[key][second_key].render = Promise.promisify(makeRender(featureViewEngine, components[key][second_key].views, key, _app));
                    components[key][second_key].viewEngine = featureViewEngine

                })
            }
        });
        this[privateName] = components;

    }

    /**
     * Get permission of one feature or all feature
     * @param name
     * @returns {{}}
     */

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

    /**
     * Get feature attribute
     * @param attributeName
     * @returns {{}}
     */

    getAttribute(attributeName) {
        let self = this;
        let privateName = "_" + self.name;
        let result = {};
        if (attributeName && _.isString(attributeName) && self[privateName]) {
            Object.keys(self[privateName]).map(function (componentName) {
                if (self[privateName][componentName] && self[privateName][componentName][attributeName]) {
                    result[componentName] = self[privateName][componentName][attributeName];
                }
            });
        } else {
            Object.keys(self[privateName]).map(function (componentName) {
                Object.keys(self[privateName][componentName]).map(function (attributeKey) {
                    if (attributeKey[0] !== "_" && ["controllers", "views", "models", "action", "routes", "viewEngine"].indexOf(attributeKey) === -1 && !_.isFunction(self[privateName][componentName][attributeKey])) {
                        result[componentName] = result[componentName] || {};
                        result[componentName][attributeKey] = self[privateName][componentName][attributeKey]
                    }
                });
            });
        }
        return result
    }

    /**
     * @param componentName
     * @param name : declare in structure.js
     * @returns {Array}
     */
    getViewFiles(componentName, name) {
        let self = this;
        let privateName = "_" + self.name;
        /* istanbul ignore next */
        let extension = self._app._config.viewExtension || "html";
        let pathFolder = [];
        let result = [];
        /* istanbul ignore else */
        if (componentName && self[privateName][componentName]) {
            /* istanbul ignore if */
            if (name) {
                if (self[privateName][componentName][name] && self[privateName][componentName][name].views) {
                    self[privateName][componentName][name].views.map(function (obj) {
                        let miniPath = handleView(obj, self, componentName);
                        pathFolder.push(miniPath);
                    })
                }
            } else {
                if (_.isArray(self[privateName][componentName].views)) {
                    self[privateName][componentName].views.map(function (obj) {
                        let miniPath = handleView(obj, self, componentName);
                        pathFolder.push(miniPath);
                    })
                } else {
                    Object.keys(self[privateName][componentName].views).map(function (key) {
                        self[privateName][componentName].views[key].map(function (obj) {
                            let miniPath = handleView(obj, self, componentName);
                            pathFolder.push(miniPath);
                        })
                    });
                }
            }
        }
        /* istanbul ignore else */
        if (!_.isEmpty(pathFolder)) {
            pathFolder.map(function (link) {
                /* istanbul ignore next */
                __.getGlobbedFiles(link + "*." + extension).map(function (result_link) {
                    result.push(result_link)
                })
            })
        }
        return result
    }

    /**
     *
     * @param componentName
     * @returns {*}
     */
    getComponent(componentName) {
        let self = this;
        let privateName = "_" + self.name;
        return self[privateName][componentName];
    }
}
/**
 *
 * @param obj
 * @param application
 * @param componentName
 * @returns {*}
 */
function handleView(obj, application, componentName) {
    let miniPath = obj.func(application._config, componentName);
    let normalizePath;
    /* istanbul ignore if */
    if (miniPath[0] === path.sep) {
        normalizePath = path.normalize(obj.base + path.sep + miniPath);
    } else {
        normalizePath = path.normalize(obj.fatherBase + path.sep + miniPath)
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

function makeRender(viewEngine, componentView, componentName, application) {
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    var cache = [];
    return JSON.parse(JSON.stringify(obj, function (key,value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return {};
            }
            cache.push(value);
        }
        return value;
    }), function (key, value) {
        if (_.isEmpty(value) && !_.isNumber(value) && !_.isBoolean(value)) {
            return
        } else {
            return value
        }
    });
    cache = null;
}

module.exports = SystemManager;