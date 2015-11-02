"use strict";
let __ = require('../libs/global_function');
let events = require('events');
let path = require('path');
let _ = require('lodash');

class SystemManager extends events.EventEmitter {
    constructor(app) {
        super();
        this.baseFolder = app.baseFolder;
        this.structure = app.structure;
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
        let _base = this.baseFolder;
        let privateName = "_" + name;
        //this[privateName] = this.structure[name];
        if (_.isArray(struc)) {
            let arrayPath = struc.map(function (a) {
                return a.path;
            });
            let paths = {};
            arrayPath.map(function (globLink) {
                let componentGlobConfig = path.normalize(_base + globLink);
                __.getGlobbedFiles(componentGlobConfig).forEach(function (link) {
                    let nodeList = path.relative(componentGlobConfig,link).split(path.sep).filter(function (node) {
                        return (node !== "..")
                    });
                    let componentConfigFunction = require(link);
                    if(typeof componentConfigFunction === "function") {
                        let componentConfig = componentConfigFunction();
                        let componentName = componentConfig.name || nodeList[0];
                        paths[componentName] = link;
                    }
                })
            });
            //Loading data
            console.log(paths);
        } else {
            console.log("b");
        }
    }
}


module.exports = SystemManager;