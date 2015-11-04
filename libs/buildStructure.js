"use strict";

let _ = require("lodash");
let path = require('path');
let globalPattern = {};

module.exports = function (struc) {
    let arrStruc = {};
    Object.keys(struc).map(function (key) {
        if (typeof struc[key] === "object") {
            if (_.isArray(struc[key])) {
                let baseStruc = struc[key][0];
                arrStruc[key] = [];
                struc[key].forEach(function (small) {
                    let assignCall = _.assign(baseStruc,small);
                    let obj = getDataFromObject(assignCall,key);
                    obj && arrStruc[key].push(obj);
                })
            } else {
                arrStruc[key] = getDataFromObject(struc[key],key);
            }

        }
    });
    return arrStruc
};



function makeGlob(level, pathInfo, fatherPath,attribute) {
    let globFolder;
    if(pathInfo.folder) {
        if(level === 1) {
            globFolder = path.normalize("/" + pathInfo.folder + "/*");
        } else {
            globFolder = path.normalize(pathInfo.folder);
        }
    } else {
        if(level === 1) {
            globFolder = "/";
        } else {
            globFolder = fatherPath;
        }
    }
    let globFile = pathInfo.file || "*.js";

    if(attribute === "view") {
        globFile = "";
    }
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
        if(attribute !== "path" && attribute !== "extends") {
            let attr = simplyObject(obj[attribute],fatherFolder,attribute);
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
            } else {
                if (typeof obj[attribute] === "function") {
                    newObj[attribute] = obj[attribute];
                }
            }
        }
    });
    return newObj;
}
function simplyObject(obj,path,attribute) {
    if(_.isArray(obj)) {
        let newObj = {};
        if (attribute === "view") {
            newObj = [];
            obj.forEach(function (_path) {
                newObj.push(makeGlob(2,_path.path,path,attribute)[0]);
            })
        } else {
            obj.forEach(function (_path) {
                if(_path.path && _path.path.name) {
                    newObj[_path.path.name] = {};
                    newObj[_path.path.name].path = makeGlob(2,_path.path,path,attribute)[0];
                    if(_path.prefix && typeof _path.prefix === "string") {
                        newObj[_path.path.name].prefix = _path.prefix;
                    }
                }
            });
        }

        obj.path = newObj;
        return obj
    }
    if (typeof obj === "object" && obj.path) {
        obj.path = makeGlob(2,obj.path,path,attribute)[0];
        return obj
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
