"use strict";
//TODO: need use winston or can change color log;
module.exports = function () {
    return console.log.call(null,'\x1b[36m',arguments[0],'\x1b[0m');
};
