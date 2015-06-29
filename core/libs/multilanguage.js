'use strict'
let path = require('path');

module.exports = function () {
    let data = {};
    __config.getGlobbedFiles(__base + '/lang/*.js').forEach(function (file) {
        var language = require(file);
        data[path.basename(file,'.js')] = language;
    })
    return data
}

