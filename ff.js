"use strict";

let _ = require("lodash");
let path = require('path');
let globalPattern = {};

module.exports = function (struc) {
    let arrStruc = {};
    Object.keys(struc).map(function (key) {
        arrStruc[key] = getDataFromArray(struc[key], key);
    })
    return arrStruc
};

function getDataFromArray(obj, key) {
    let newObj = {};
    let wrapArray = [];


    if (_.isArray(obj)) {
        wrapArray = obj;
    } else if (_.isObject(obj)) {
        wrapArray.push(obj);
    }

    wrapArray.map(function (data) {
        //handle path
        if (data.path) {
            newObj.path = {};
            let pathInfo = handlePath(data.path, key);
            let pathKey = pathInfo[1] || wrapArray.indexOf(data);
            newObj.path[pathKey] = {};
            newObj.path[pathKey].path = pathInfo[0];
        } else {
            return null;
        }

        Object.keys(data).map(function (key) {
            if (key === "extends") {
                newObj.extends = data.extends;
            }

            if (typeof data.key === 'function') {
                newObj[key] = data[key];
            }

            if (['controller', "view", "helper", "model"].indexOf(key) > -1) {
                data[key].path && !data[key].path.singleton && (data[key].path.singleton = true);
                newObj[key] = getDataFromArray(data[key], key);
            }

        })
    });
    return newObj
}
function handlePath(pathInfo, attribute) {

    if (pathInfo) {
        let singleton = handleSingleton(pathInfo.singleton);
        let folderName = handleFolder(pathInfo.folder);
        let depend = handleDepend(pathInfo.depend);
        let fileName = handleDepend(pathInfo.file);
        let name = handleName(pathInfo.name);

        switch (attribute) {
            case "view":
                break;
            default:
                break;
        }

        let results = [];
        folderName.map(function (folderInfo) {
            let backInfo = singleton + "/" + fileName;
            let frontkey = folderInfo;
            let result;
            if (folderInfo.indexOf("*") > -1) {
                if (depend) {
                    result = pathWithConfig(frontkey, backInfo).bind(null, depend);
                } else {
                    throw Error("folder not contain '*' without  depend attribute ");
                }
            } else {
                result = pathWithConfig(frontkey, backInfo).bind(null, null);
            }
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
    return newFolder;
}

function handleName(name) {
    if (_.isString(name)) return name;
    return "";
}

function handleDepend(depend) {
    let newDepend = [];
    if (_.isArray(depend)) {
        depend.map(function (dependInfo) {
            newDepend.push(dependInfo)
        })
    }
    if (_.isString(depend)) {
        newDepend.push(depend);
    }
    return depend;
}

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

function pathWithConfig(front, back) {
    return function makeGlob(key) {
        let config = arguments[1];
        let frontArray = front.split("*");
        let newFront = "";
        let newArray = [];
        if (_.isString(key)) {
            newArray.push(key);
        } else {
            newArray = key;
        }
        if (frontArray.length > 1) {
            frontArray.map(function (frontKey) {
                let index = frontArray.indexOf(frontKey);
                if (index < frontArray.length - 1) {
                    newFront += frontKey + ( config[newArray[index]] || "")
                } else {
                    newFront += frontKey
                }
            });
            newFront = newFront.replace(/\*/g, "");
            return path.normalize(newFront + back)
        }

        let endPath = path.normalize(front + back);
        return endPath;
    }
}