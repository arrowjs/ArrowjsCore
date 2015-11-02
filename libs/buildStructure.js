"use strict";

let _ = require("lodash");
let path = require('path');
let globalPattern = {};

module.exports = function (struc) {
    let arrStruc = {};
    Object.keys(struc).map(function (key) {
        if (typeof struc[key] === "object") {
            if (_.isArray(struc[key])) {
                arrStruc[key] = [];
                struc[key].forEach(function (small) {
                    let obj = getDataFromObject(small,key);
                    obj && arrStruc[key].push(obj);
                })
            } else {
                arrStruc[key] = getDataFromObject(struc[key],key);
            }

        }
    });
    return arrStruc
};



function makeGlob(level, pathInfo, fatherPath) {
    let globFolder;
    if(pathInfo.folder) {
        if(level === 1) {
            globFolder = path.normalize("/" + pathInfo.folder + "/*");
        } else {
            if(pathInfo.folder[0] !== "/") {
                globFolder = path.normalize(pathInfo.folder);
            } else {
                globFolder = path.normalize("/" + pathInfo.folder );
            }
        }
    } else {
        if(level === 1) {
            globFolder = "/";
        } else {
            globFolder = fatherPath;
        }
    }
    let globFile = pathInfo.file || "*.js";
    globFile = path.normalize(globFolder + "/" + globFile);
    return [globFile,globFolder]
}

function getDataFromObject(obj,key) {
    let newObj = {};
    let fatherFolder;
    let localPattern = {};

    if (obj.path && (obj.path.folder || obj.path.file)) {
        let arrayPath = makeGlob(1,obj.path,"/");
        newObj.path = arrayPath[0];
        fatherFolder = arrayPath[1];
    } else {
        return null
    }

    let objectKey = checkPatternExist(globalPattern,newObj.path);

    if(objectKey.length > 0) {
        let errorMessage = "Pattern already exists: Check '" + key + "' in structure.js";
        throw Error(errorMessage);
    } else {
        globalPattern[key] = newObj.path;
    }

    if (obj.extends) {
        newObj.extends = obj.extends;
    }

    //controller,helper,route,model,view
    Object.keys(obj).map(function (attribute) {
        if(attribute !== "path" && attribute != "extends") {
            let attr = simplyObject(obj[attribute],fatherFolder);
            if(attr) {
                newObj[attribute] = attr;
                if(attr.path[0] !== '/') {
                    let localPatternCheck = checkPatternExist(localPattern,attr.path);
                    if(localPatternCheck.length > 0) {
                        let errorMessage = "Pattern already exists: Check '" + key + "' : '"+ attribute + "' in structure.js";
                        throw Error(errorMessage);
                    } else {
                        localPattern[attribute] = attr.path;
                    }
                } else {
                    let globalPatternCheck = checkPatternExist(localPattern,attr.path);
                    if(globalPatternCheck.length > 0) {
                        let errorMessage = "Pattern already exists: Check '" + key + "' : '"+ attribute +"' in structure.js";
                        throw Error(errorMessage);
                    } else {
                        globalPatternCheck[attribute] = attr.path;
                    }
                }
            }

        }
    });

    return newObj;
}

function simplyObject(obj,path) {
    if (typeof obj === "object" && obj.path) {
        obj.path = makeGlob(2,obj.path,path)[0];
        return obj
    } else {
        return null
    }
}

function checkPatternExist(patternObject,patternNeedCheck) {
    let test = [];
    Object.keys(patternObject).map(function (key) {
        if (patternObject[key] === patternNeedCheck) {
            return test.push(key)
        }
    });
    return test;
}

module.exports.stringWithAsterisk = function (path_string) {

};



module.exports.stringNoAsterisk = function (path_string) {
    path_string = path.normalize("/" + path_string);
    return path_string + "/*"
};