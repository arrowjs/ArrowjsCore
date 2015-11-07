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
                components[name].models = {};
                components[name].views = [];
                //components[name].helpers = {};


                let componentConfig = require(paths[name].configFile)();
                _.assign(components[name], componentConfig);
                Object.keys(components[name]._structure).map(function (attribute) {
                    let data = actionByAttribute(attribute, components[name], paths[name].path, _app);
                    _.assign(components[name], data);
                });

            } else {
                //TODO : logic multi id
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

        // Setup view engine by name;
        //let componentsView = {};
        //componentsView.default = [];
        //
        //Object.keys(components).map(function (key) {
        //    if (components[key].views) {
        //        Object.keys(components[key].views).map(function (view_id) {
        //            if (!_.isNaN(parseInt(view_id))) {
        //                componentsView.default.push(components[key].views[view_id])
        //            } else {
        //                componentsView[view_id] = componentsView[view_id] || [];
        //                componentsView[view_id].push(components[key].views[view_id]);
        //            }
        //        })
        //    }
        //});
        //TODO: need logic with name;

        let defaultDatabase = {};
        let defaultQueryResolve = function () {
            return new Promise(function (fulfill,reject) {
                fulfill("No models")
            })
        };

        Object.keys(components).map(function (key) {
            if(Object.keys(components[key].models).length > 0 ) {
                if (_.isEmpty(defaultDatabase)) {
                    defaultDatabase = Database(_app);
                }
            }

            components[key].models.rawQuery = defaultDatabase.query ? defaultDatabase.query.bind(defaultDatabase) : defaultQueryResolve;

            //components[key].renderAndSend = function (name, ctx, cb) {
            //
            //};
            components[key].render = function (name, ctx, cb) {
                if (_app._config.viewExtension && name.indexOf(_app._config.viewExtension) === -1) {
                    name += "." + _app._config.viewExtension;
                }
                return new Promise(function(fulfill,reject){
                    _app.viewTemplateEngine.loaders[0].searchPaths = components[key].views;
                    _app.viewTemplateEngine.render.call(_app.viewTemplateEngine,name, ctx, function (err,html) {
                        if(err) {
                            reject(err);
                        }
                        fulfill(html);
                    });
                })
            };
        });

        this[privateName] = components;
    }
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
    return setting
}

function modelAttribute(setting, fatherPath, component, application) {
    let files = getlistFile(setting, fatherPath, application);
    let database = Database(application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let model = database.import(path.resolve(link));
                    component.models[model.name] = model
                })
            }
        });
        Object.keys(component.models).forEach(function (modelName) {
            if ("associate" in component.models[modelName]) {
                component.models[modelName].associate(component.models)
            }
        });
    } else if (files.type === "multi") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.models[key] = {};
                files[key].map(function (link) {
                    let model = database.import(path.resolve(link));
                    component.models[key][model.name] = model
                });
                Object.keys(component.models[key]).forEach(function (modelName) {
                    if ("associate" in component.models[key][modelName]) {
                        component.models[key][modelName].associate(component.models[key])
                    }
                });
            }
        })
    }
}
function viewAttribute(setting, fatherPath, component, application) {
    let folders = getListFolder(setting, fatherPath, application);
    if (folders.type === "single") {
        Object.keys(folders).map(function (key) {
            if (key !== "type") {
                folders[key].map(function (link) {
                    component.views.push(link);
                })
            }
        })
    } else if (folders.type === "multi") {
        Object.keys(folders).map(function (key) {
            if (key !== "type") {
                component.views[key] = [];
                folders[key].map(function (link) {
                    component.views[key].push(link);
                })
            }
        })
    }
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
//TODO: helper logic
function helperAttribute(setting, fatherPath) {
    //let files = getlistFile(setting, fatherPath, application.arrFolder);
    //Object.keys(files).map(function (key) {
    //    if (typeof files[key] === "string") {
    //        require(link).call(null, component.helpers, component, application);
    //    } else if (files[key].length > 0) {
    //        files[key].map(function (link) {
    //            component.helpers[key] = {};
    //            if (typeof key === "string") {
    //                require(link).call(null, component.helpers[key], component, application);
    //            } else {
    //                require(link).call(null, component.helpers, component, application);
    //            }
    //        })
    //    }
    //});
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

function getListFolder(componentSetting, fatherPath, application) {
    let folders = {};
    let componentPath = componentSetting.path;
    folders.type = componentSetting.type;
    if (componentPath) {
        Object.keys(componentPath).map(function (id) {
            folders[id] = [];
            componentPath[id].path.map(function (globByConfig) {
                let miniPath = globByConfig(application._config);
                let normalizePath;
                if (miniPath[0] === "/") {
                    normalizePath = path.normalize(application.arrFolder + "/" + miniPath);
                } else {
                    normalizePath = path.normalize(fatherPath + "/" + miniPath)
                }
                folders[id].push(normalizePath);
            })
        });
    }
    return folders
}

module.exports = SystemManager;