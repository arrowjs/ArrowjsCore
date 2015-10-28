"use strict";

//Change code TJ to es 6

module.exports = function(lineNumber){
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    let err = new Error;
    //Error.captureStackTrace(err, arguments.callee);
    let stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack[lineNumber].getFileName();
};
