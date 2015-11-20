"use strict";

const _ = require("lodash"),
    path = require('path'),
    logger = require('./logger');
let globalPattern = {};

module.exports = function (struc) {
    let arrStruc = {};
    Object.keys(struc).map(function (key) {
        arrStruc[key] = parseConfig_Structure(struc[key], key,1);
    });
    return arrStruc
};
/**
 * Parse key-value in /config/structure.js
 * @param obj
 * @param key
 * @param level
 * @returns {{}}
 */
function parseConfig_Structure(obj, key,level) {
    let newObj = {};
    let wrapArray = [];
    if (_.isArray(obj)) {
        wrapArray = obj;
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
            let pathInfo = handlePath(data.path, key,level);

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

                if (typeof data.key === 'function') {
                    newObj.path[pathKey][key] = data[key];
                }

                if (['controller', "view", "action", "model", "route"].indexOf(key) > -1) {
                    if (_.isArray(data[key])) {
                        data[key].map(function (data_key) {
                            if (!data_key.path.singleton) {
                                data_key.path.singleton = true;
                            }
                        });
                    } else {
                        if (!data[key].path.singleton) {
                            data[key].path.singleton = true;
                        }
                    }
                    newObj.path[pathKey][key] = parseConfig_Structure(data[key], key ,2);
                } else {
                    if (key !== "extend" && key !== "path" && typeof data.key === 'object') {
                        newObj.path[pathKey][key] = data[key]
                    }
                }
            });

            if(data.path.prefix) {
                newObj.path[pathKey].prefix = handlePrefix(data.path.prefix);
            }

            if(data.path.authenticate) {
                newObj.path[pathKey].authenticate = handleAthenticate(data.path.authenticate);
            }
        } else {
            return null;
        }
    });
    return newObj
}
function handlePath(pathInfo, attribute,level) {
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
                if(name) {
                    logger.warn('Carefully : Cant set "name" attribute at level 1 in structure.js');
                }
                name = "";
                break;
            case 2:
                break;
            default:
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
    return [null, null]
}

function handleSingleton(singleton) {
    if (!singleton) return "/*";
    return ""
}

function handleFolder(folder) {
    let newFolder = [];
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

function getConfigByKey(key) {
    return function (key) {
        let self = this;
        return self._config[key]
    }
}

function handlePrefix(prefix) {
    if (_.isString(prefix)) {
        return prefix
    }
    return "";
}

function handleAthenticate(authenticate){
    if(_.isBoolean(authenticate)){
        return authenticate
    }
    return false
}

function pathWithConfig(front, back) {
    return function makeGlob(config,name) {
        let frontArray = front.split("/");
        let filterArray = frontArray.filter(function (key) {
            return key[0] === ":"
        });
        let stringPath;
        if(_.isEmpty(filterArray)) {
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

            stringPath =  path.normalize(frontArray.join('/') + back)
        }
        return stringPath.replace(/\$component/g,name);

    }
}