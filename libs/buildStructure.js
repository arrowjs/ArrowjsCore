"use strict";

const _ = require("lodash"),
    path = require('path');
let globalPattern = {};

module.exports = function (struc) {
    if (_.isObject(struc)) {
        let arrStruc = {};
        Object.keys(struc).map(function (key) {
            let data = parseConfig_Structure(struc[key], key, 1);
            if (data) {
                arrStruc[key] = data;
            }
        });
        return arrStruc
    } else {
        throw new Error("config/structure.js is not an object")
    }

};
/**
 * Parse key-value in /config/structure.js
 * @param obj
 * @param key
 * @param level
 * @returns {{}}
 */
function parseConfig_Structure(obj, key, level) {
    let newObj = {};
    let wrapArray = [];
    if (_.isArray(obj)) {
        wrapArray = obj;
        /* istanbul ignore else */
    } else if (_.isObject(obj)) {
        wrapArray.push(obj);
    }
    let baseObject = wrapArray[0];
    newObj.path = {};
    newObj.type = "single";  //When feature has one namespace
    wrapArray.map(function (data, index) {
        //handle path
        if (data.path) {
            data = _.assign(baseObject, data);
            let pathInfo = handlePath(data.path, key, level);

            //When feature has more than one namespace
            if (!_.isEmpty(pathInfo[1])) {
                newObj.type = "multi";
            }
            let pathKey = pathInfo[1] || index;
            newObj.path[pathKey] = {};
            newObj.path[pathKey].path = pathInfo[0];
            Object.keys(data).map(function (key) {
                if (key === "extend") {
                    newObj.path[pathKey].extend = data.extend;
                }

                //if (typeof data.key === 'function') {
                //    newObj.path[pathKey][key] = data[key];
                //}

                if (['controller', "view", "action", "model", "route"].indexOf(key) > -1) {
                    //if (!_.isEmpty(data[key].path)) {
                    if (_.isArray(data[key])) {
                        data[key].map(function (data_key) {
                            /* istanbul ignore else */
                            if (!data_key.path.singleton) {
                                data_key.path.singleton = true;
                            }
                        });
                        newObj.path[pathKey][key] = parseConfig_Structure(data[key], key, 2);
                    } else {
                        if (!_.isEmpty(data[key].path)) {
                            if (!data[key].path.singleton) {
                                data[key].path.singleton = true;
                            }
                            newObj.path[pathKey][key] = parseConfig_Structure(data[key], key, 2);
                        }
                    }
                    //}
                } else {
                    /* istanbul ignore next */
                    if (key !== "extend" && key !== "path" && typeof data.key === 'object') {
                        newObj.path[pathKey][key] = data[key]
                    }
                }
            });

            if (data.path.prefix) {
                newObj.path[pathKey].prefix = handlePrefix(data.path.prefix);
            }

            if (data.path.authenticate) {
                newObj.path[pathKey].authenticate = handleAthenticate(data.path.authenticate);
            }
        } else {
            return null;
        }
    });
    if (_.isEmpty(newObj.path)) {
        return null
    } else {
        return newObj
    }
}
function handlePath(pathInfo, attribute, level) {
    /* istanbul ignore else */
    if (pathInfo) {
        let singleton = handleSingleton(pathInfo.singleton);
        let folderName = handleFolder(pathInfo.folder);
        let fileName = handleFile(pathInfo.file);
        let name = handleName(pathInfo.name);
        switch (attribute) {
            case "view":
                fileName = "";
                break;
            case "controller":
                break;
            case "action":
                break;
            case "route":
                break;
            case "model":
                break;
            default:
                break;
        }

        switch (level) {
            case 1:
                if (name) {
                    name = "";
                }
                break;
            case 2:
                break;
        }

        let results = [];
        folderName.map(function (folderInfo) {
            let backInfo;
            if (folderInfo) {
                backInfo = singleton + "/" + fileName;
            } else {
                backInfo = fileName;
            }
            let frontkey = folderInfo || "";
            let result = pathWithConfig(frontkey, backInfo);
            results.push(result);
        });
        return [results, name];
    }
    /* istanbul ignore next */
    return [null, null]
}

function handleSingleton(singleton) {
    if (!singleton) return "/*";
    return ""
}

function handleFolder(folder) {
    let newFolder = [];
    /* istanbul ignore next */
    if (_.isArray(folder)) {
        folder.map(function (folderInfo) {
            newFolder.push(folderInfo)
        })
    }
    if (_.isString(folder)) {
        newFolder.push(folder);
    }
    if (!folder) {
        newFolder.push("");
    }
    return newFolder;
}

function handleName(name) {
    if (_.isString(name)) return name;
    return "";
}

//function handleDepend(depend) {
//    let newDepend = [];
//    if (_.isArray(depend)) {
//        depend.map(function (dependInfo) {
//            newDepend.push(dependInfo)
//        })
//    }
//    if (_.isString(depend)) {
//        newDepend.push(depend);
//    }
//    return depend;
//}

function handleFile(file) {
    if (_.isString(file)) {
        return file
    }
    return "";
}

//function getConfigByKey(key) {
//    return function (key) {
//        let self = this;
//        return self._config[key]
//    }
//}

function handlePrefix(prefix) {
    /* istanbul ignore else */
    if (_.isString(prefix)) {
        return prefix
    }
    /* istanbul ignore next */
    return "";
}

function handleAthenticate(authenticate) {
    /* istanbul ignore else */
    if (_.isBoolean(authenticate)) {
        return authenticate
    }
    /* istanbul ignore next */
    return false
}

function pathWithConfig(front, back) {
    return function makeGlob(config, name) {
        let frontArray = front.split("/");
        let filterArray = frontArray.filter(function (key) {
            return key[0] === ":"
        });
        let stringPath;
        if (_.isEmpty(filterArray)) {
            stringPath = path.normalize(front + back);
        } else {
            frontArray = frontArray.map(function (key) {
                if (key[0] === ":") {
                    let configKey = key.slice(1);
                    return (config[configKey] || "")
                } else {
                    return key
                }
            });

            stringPath = path.normalize(frontArray.join(path.sep) + back)
        }
        return path.normalize(stringPath.replace(/\$component/g, name || ""));

    }
}

module.exports.pathWithConfig = pathWithConfig;