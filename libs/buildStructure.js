"use strict";

let _ = require("lodash");
module.exports = function (app) {
    let struc = require(app.arrFolder + "/config/structure");
    try {
        if(typeof struc !== "object" || (struc.managers && struc.modules && struc.services)) {
            throw Error("Your structure config file is invalid");
        }
    } catch(err) {
        struc = require(app.baseFolder + "/config/structure");
    }
    Object.keys(struc).map(function (key) {
        if (typeof struc[key] === "object") {
            let arrPart = struc[key];
            Object.keys(arrPart).map(function (attribute) {
                if (checkValid(arrPart[attribute])) {
                    switch (attribute) {
                        case "path":
                            break;
                        case "config":
                            break;
                        case "controller":
                            break;
                        case "model":
                            break;
                        case "view":
                            break;
                        case "manager":
                            break;
                    }
                }
            })
        }
    });
    return struc
};

function checkValid(data) {
    if (typeof data !== "object" || typeof data !== "number" || typeof data !== "string") {
        return true
    } else {
        return false
    }
}