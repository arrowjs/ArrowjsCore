"use strict";
/**
 * This module is inspired by CallSite module https://www.npmjs.com/package/callsite
 * Modify to compatible with ES6
 * @param lineNumber
 * @returns {*}
 */
module.exports = function(lineNumber){
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    let err = new Error;
    //Error.captureStackTrace(err, arguments.callee);
    let stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack[lineNumber].getFileName();
};

//module.exports.stack =function(){
//    let orig = Error.prepareStackTrace;
//    Error.prepareStackTrace = function(_, stack){ return stack; };
//    let err = new Error;
//    //Error.captureStackTrace(err, arguments.callee);
//    let stack = err.stack;
//    Error.prepareStackTrace = orig;
//    return stack;
//};