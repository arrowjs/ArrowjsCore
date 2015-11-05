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
        let struc = this.structure[name];
        let _base = this.arrFolder;
        let privateName = "_" + name;
        let components = {};
        let _app = this._app;
        let paths = {};
        if (_.isArray(struc)) {
            let arrayPath = struc.map(function (a) {
                return a.path;
            });
            arrayPath.map(function (globLink) {
                let componentGlobConfig = path.normalize(_base + globLink);
                let listComponents = __.getGlobbedFiles(componentGlobConfig);
                let componentFolder = componentGlobConfig.slice(0, componentGlobConfig.indexOf('*'));
                listComponents.forEach(function (link) {
                    let nodeList = path.relative(componentGlobConfig, link).split(path.sep).filter(function (node) {
                        return (node !== "..")
                    });
                    let componentConfigFunction = require(link);
                    if (typeof componentConfigFunction === "function") {
                        let componentConfig = componentConfigFunction();
                        let componentName = componentConfig.name || nodeList[0];
                        paths[componentName] = {};
                        paths[componentName].configFile = link;
                        paths[componentName].path = componentFolder + nodeList[0];
                        paths[componentName].strucID = arrayPath.indexOf(globLink);
                    }
                });
            });
        } else {
            let componentGlobConfig = path.normalize(_base + struc.path);
            let listComponents = __.getGlobbedFiles(componentGlobConfig);
            let componentFolder = componentGlobConfig.slice(0, componentGlobConfig.indexOf('*'));
            listComponents.forEach(function (link) {
                let nodeList = path.relative(componentGlobConfig, link).split(path.sep).filter(function (node) {
                    return (node !== "..")
                });
                let componentConfigFunction = require(link);
                if (typeof componentConfigFunction === "function") {
                    let componentConfig = componentConfigFunction();
                    let componentName = componentConfig.name || nodeList[0];
                    paths[componentName] = {};
                    paths[componentName].configFile = link;
                    paths[componentName].path = componentFolder + nodeList[0];
                    paths[componentName].strucID = 0;
                }
            });
        }
        Object.keys(paths).map(function (name) {
            components[name] = {};
            components[name]._path = paths[name].path;
            components[name]._configFile = paths[name].configFile;
            components[name]._strucID = paths[name].strucID;
            components[name]._structure = struc[paths[name].strucID] || struc;
            components[name].controllers = {};
            components[name].models = {};
            components[name].helpers = {};
            components[name].views = [];
            components[name].routes = Express.Router();

            let componentConfig = require(paths[name].configFile)();
            _.assign(components[name], componentConfig);
            Object.keys(components[name]._structure).map(function (attribute) {
                let data = actionByAttribute(components[name]._structure, attribute, paths[name].path, components[name], _app);
                _.assign(components[name], data);
            });

            console.log(components[name].views);
        });

        this[privateName] = components;
    }
}

function getlistFile(componentPath, fatherPath, basePath) {
    let files = [];
    if (componentPath.path && typeof componentPath.path === "string") {
        if (componentPath.path[0] === "/") {
            let normalizepath = path.normalize(basePath + "/" + componentPath.path);
            __.getGlobbedFiles(normalizepath).map(function (componentLink) {
                files.push(componentLink);
            })
        } else {
            let normalizepath = path.normalize(fatherPath + "/" + componentPath.path);
            __.getGlobbedFiles(normalizepath).map(function (componentLink) {
                files.push(componentLink);
            })
        }
    }
    if (componentPath.path && typeof componentPath.path === "object") {
        Object.keys(componentPath.path).map(function (key) {
            files[key] = [];
            if (componentPath.path[0] === "/") {
                let normalizepath = path.normalize(basePath + "/" + componentPath.path);
                __.getGlobbedFiles(normalizepath).map(function (componentLink) {
                    files[key].push(componentLink);
                })
            } else {
                if (typeof componentPath.path[key] === "object") {
                    let normalizepath = path.normalize(fatherPath + "/" + componentPath.path[key].path);
                    __.getGlobbedFiles(normalizepath).map(function (componentLink) {
                        files[key].push(componentLink);
                    })
                } else {
                    let normalizepath = path.normalize(fatherPath + "/" + componentPath.path[key]);
                    __.getGlobbedFiles(normalizepath).map(function (componentLink) {
                        files[key].push(componentLink);
                    })
                }
            }
        })
    }
    return files
}

function getListFolder(componentPath, fatherPath, basePath) {
    let folders = [];

    if (_.isArray(componentPath)) {
            Object.keys(componentPath.path).map(function (nameFolder) {
                if(typeof nameFolder === "string") {
                    folders[nameFolder] = [];
                    if(_.isArray(componentPath.path[nameFolder])){
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


function actionByAttribute(struc, attName, fatherPath, component, application) {
    let setting = struc[attName];
    switch (attName) {
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
function viewAttribute(setting, fatherPath,component, application) {
    let obj = Object.create(null);
    let folderList = getListFolder(setting, fatherPath, application.arrFolder);
    return obj = folderList;
}
function controllerAttribute(setting, fatherPath, component, application) {
    let files = getlistFile(setting, fatherPath, application.arrFolder);
    Object.keys(files).map(function (key) {
        if (typeof files[key] === "string") {
            try {
                require(files[key]).call(null, component.controllers, component, application);
            } catch (err) {
                throw Error("This component dont this attribute");
            }
        } else if (files[key].length > 0) {
            files[key].map(function (link) {
                component.controllers[key] = {};
                if (typeof key === "string") {
                    require(link).call(null, component.controllers[key], component, application);
                } else {
                    require(link).call(null, component.controllers, component, application);
                }
            })
        }
    });
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
    let files = getlistFile(setting, fatherPath, application.arrFolder);
    Object.keys(files).map(function (key) {
        if (typeof files[key] === "string") {
            require(files[key]).call(null, component.routes, component, application);
        } else if (files[key].length > 0) {
            files[key].map(function (link) {
                component.routes[key] = Express.Router();
                if (typeof key === "string") {
                    require(link).call(null, component.routes[key], component, application);
                } else {
                    require(link).call(null, component.routes, component, application);
                }
            })
        }
    });
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

module.exports = SystemManager;