'use strict';

let path = require('path');

module.exports = function () {
    let data = {};

    __.getGlobbedFiles(__base + '/lang/*.js').forEach(function (file) {
        data[path.basename(file, '.js')] = require(file);
    });

    return data;
};

