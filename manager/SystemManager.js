"use strict";
let __ = require('../libs/global_function');
let events = require('events');
let path = require('path');
let _ = require('lodash');
let Database = require("../libs/database");
let Express = require('express');


class SystemManager extends events.EventEmitter {
    constructor(app) {
        super();
        this._config = app._config;
        this.arrFolder = app.arrFolder;
        this.structure = app.structure;
        this._arrType = "manager";
        this.pub = app.redisCache;
        this.sub = app.RedisCache();
        this._app = app;
    }

    getCache() {

    }

    setCache() {

    }

    reload() {

    }

    eventHook(events) {
        this._events = events._events
    }

    loadComponents(name) {
        let self = this;
        let struc = this.structure[name];
        let _base = this.arrFolder;
        let privateName = "_" + name;
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
                        if (typeof componentConfigFunction === "function") {
                            let componentConfig = componentConfigFunction();
                            let componentName = componentConfig.name || nodeList[0];
                            paths[componentName] = {};
                            paths[componentName].configFile = link;
                            paths[componentName].path = componentFolder + nodeList[0];
                            paths[componentName].strucID = id;
                        }
                    });
                });
            })
        } else if (struc.type === "multi") {
            Object.keys(struc.path).map(function (id) {
                if (!_.isNaN(parseInt(id))) {
                    struc.path[id].path.map(function (globMaker) {
                        let componentGlobLink = path.normalize(_base + globMaker(self._config));
                        let listComponents = __.getGlobbedFiles(componentGlobLink);
                        let componentFolder = componentGlobLink.slice(0, componentGlobLink.indexOf('*'));
                        listComponents.forEach(function (link) {
                            let nodeList = path.relative(componentGlobLink, link).split(path.sep).filter(function (node) {
                                return (node !== "..")
                            });
                            let componentConfigFunction = require(link);
                            if (typeof componentConfigFunction === "function") {
                                let componentConfig = componentConfigFunction();
                                let componentName = componentConfig.name || nodeList[0];
                                paths[componentName] = {};
                                paths[componentName].configFile = link;
                                paths[componentName].path = componentFolder + nodeList[0];
                                paths[componentName].strucID = id;
                            }
                        });
                    });
                } else {
                    struc.path[id].path.map(function (globMaker) {
                        let componentGlobLink = path.normalize(_base + globMaker(self._config));
                        let listComponents = __.getGlobbedFiles(componentGlobLink);
                        let componentFolder = componentGlobLink.slice(0, componentGlobLink.indexOf('*'));
                        listComponents.forEach(function (link) {
                            let nodeList = path.relative(componentGlobLink, link).split(path.sep).filter(function (node) {
                                return (node !== "..")
                            });
                            let componentConfigFunction = require(link);
                            if (typeof componentConfigFunction === "function") {
                                let componentConfig = componentConfigFunction();
                                let componentName = componentConfig.name || nodeList[0];
                                paths[id] = {};
                                paths[id][componentName] = {};
                                paths[id][componentName].configFile = link;
                                paths[id][componentName].path = componentFolder + nodeList[0];
                                paths[id][componentName].strucID = id;
                            }
                        });
                    });
                }
            })
        }
        Object.keys(paths).map(function (name) {
            let id = paths[name].strucID;
            if (!_.isNaN(parseInt(paths[name].strucID))) {
                components[name] = {};
                components[name]._path = paths[name].path;
                components[name]._configFile = paths[name].configFile;
                components[name]._strucID = id;
                components[name]._structure = struc.path[id] || struc;
                components[name].controllers = {};
                components[name].routes = Express.Router();
                //components[name].models = {};
                //components[name].helpers = {};
                //components[name].views = [];

                let componentConfig = require(paths[name].configFile)();
                _.assign(components[name], componentConfig);
                Object.keys(components[name]._structure).map(function (attribute) {
                    let data = actionByAttribute(attribute, components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                });

            } else {
                //TODO : need finish;
                components[id][name] = {};
                components[id][name]._path = paths[name].path;
                components[id][name]._configFile = paths[name].configFile;
                components[id][name]._strucID = id;
                components[id][name]._structure = struc.path[id] || struc;
                components[id][name].controllers = {};

                let componentConfig = require(paths[name].configFile)();
                _.assign(components[id][name], componentConfig);
                Object.keys(components[id][name]._structure).map(function (attribute) {
                    let data = actionByAttribute(attribute, components[id][name], paths[name].path, _app);
                    _.assign(components[id][name], data);
                });
            }
        });
        this[privateName] = components;
    }
}


function getListFolder(componentPath, fatherPath, basePath) {
    let folders = [];

    if (_.isArray(componentPath)) {
        Object.keys(componentPath.path).map(function (nameFolder) {
            if (typeof nameFolder === "string") {
                folders[nameFolder] = [];
                if (_.isArray(componentPath.path[nameFolder])) {
                    componentPath.path[nameFolder].map(function (key) {
                        let normalizePath = path.normalize(basePath + "/" + key);
                        folders[nameFolder].push(normalizePath);

                    })
                } else {
                    let normalizePath = path.normalize(basePath + "/" + componentPath.path[nameFolder]);
                    folders[nameFolder].push(normalizePath);
                }
            } else {
                if (folderInfo[0] === "/") {
                    let normalizepath = path.normalize(basePath + "/" + folderInfo);
                    folders.push(normalizepath);
                } else {
                    let normalizepath = path.normalize(fatherPath + "/" + folderInfo);
                    folders.push(normalizepath);
                }
            }
        })

    } else {
        if (componentPath.path[0] === "/") {
            let normalizepath = path.normalize(basePath + "/" + componentPath.path);
            folders.push(normalizepath);
        } else {
            let normalizepath = path.normalize(fatherPath + "/" + componentPath.path);
            folders.push(normalizepath);
        }
    }
    return folders;
}


function actionByAttribute(attName, component, fatherPath, application) {
    let setting = component._structure[attName];
    switch (attName) {
        case "path" :
            return pathAttribute();
        case "extends":
            return extendsAttribute(setting);
        case "model":
            return modelAttribute(setting, fatherPath, component, application);
        case "route":
            return routeAttribute(setting, fatherPath, component, application);
        case "view" :
            return viewAttribute(setting, fatherPath, component, application);
        case "helper":
            return helperAttribute(setting, fatherPath, component, application);
        case "controller":
            return controllerAttribute(setting, fatherPath, component, application);
        default :
            return otherAttribute(setting, attName, component);
    }
}

function extendsAttribute(setting) {
    let obj = setting;
    return obj
}

function modelAttribute(setting, fatherPath, component, application) {
    let files = getlistFile(setting, fatherPath, application.arrFolder);
    let database = Database(application);
    let db = {};
    Object.keys(files).map(function (key) {
        let model = database.import(path.resolve(files[key]));
        db[model.name] = model
    });
    Object.keys(db).forEach(function (modelName) {
        if ("associate" in db[modelName]) {
            db[modelName].associate(db)
        }
    });
    component.models = db;
}
function viewAttribute(setting, fatherPath, component, application) {
    let obj = Object.create(null);
    let folderList = getListFolder(setting, fatherPath, application.arrFolder);
    obj.views = folderList;
    return obj;
}
function controllerAttribute(setting, fatherPath, component, application) {
    let files = getlistFile(setting, fatherPath, application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    require(link).call(null, component.controllers, component, application);
                })
            }
        })
    } else if (files.type === "multi") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.controllers[key] = {};
                files[key].map(function (link) {
                    require(link).call(null, component.controllers[key], component, application);
                })
            }
        })
    }
}

function helperAttribute(setting, fatherPath) {
    let files = getlistFile(setting, fatherPath, application.arrFolder);
    Object.keys(files).map(function (key) {
        if (typeof files[key] === "string") {
            require(link).call(null, component.helpers, component, application);
        } else if (files[key].length > 0) {
            files[key].map(function (link) {
                component.helpers[key] = {};
                if (typeof key === "string") {
                    require(link).call(null, component.helpers[key], component, application);
                } else {
                    require(link).call(null, component.helpers, component, application);
                }
            })
        }
    });
}

function routeAttribute(setting, fatherPath, component, application) {
    let files = getlistFile(setting, fatherPath, application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    require(link).call(null, component.routes, component, application);
                })
            }
        })
    } else if (files.type === "multi") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.routes[key] = Express.Router();
                files[key].map(function (link) {
                    require(link).call(null, component.routes[key], component, application);
                })
            }
        })
    }
}

function otherAttribute(setting, attName, component) {
    let obj = Object.create(null);
    if (typeof setting === "function") {
        obj[attName] = setting.bind(component);
    } else {
        obj[attName] = setting;
    }
    return obj
}

function pathAttribute() {
    return null;
}

function getlistFile(componentSetting, fatherPath, application) {
    let files = {};
    let componentPath = componentSetting.path;
    files.type = componentSetting.type;
    if (componentPath) {
        Object.keys(componentPath).map(function (id) {
            files[id] = [];
            componentPath[id].path.map(function (globByConfig) {
                let miniPath = globByConfig(application._config);
                let normalizePath;
                if (miniPath[0] === "/") {
                    normalizePath = path.normalize(application.arrFolder + "/" + miniPath);
                } else {
                    normalizePath = path.normalize(fatherPath + "/" + miniPath)
                }
                __.getGlobbedFiles(normalizePath).map(function (componentLink) {
                    files[id].push(componentLink);
                })
            })
        });
    }
    return files
}


module.exports = SystemManager;